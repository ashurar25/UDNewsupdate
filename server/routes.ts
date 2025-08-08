import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsArticleSchema, insertRssSourceSchema } from "@shared/schema";
import { z } from "zod";

// Simple RSS parser using built-in XML parsing
async function parseRSSFeed(url: string, sourceName: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UD-News-Aggregator/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    
    // Basic RSS parsing - extract items
    const items = extractRSSItems(xmlText);
    const articles = [];
    
    for (const item of items) {
      try {
        // Check if article already exists
        const existing = await storage.getNewsArticleByLink(item.link);
        if (existing) continue;
        
        const article = {
          title: item.title,
          description: item.description,
          content: item.description, // Use description as content for RSS
          link: item.link,
          source: sourceName.toLowerCase(),
          imageUrl: item.imageUrl,
          publishedAt: item.publishedAt,
        };
        
        const validatedArticle = insertNewsArticleSchema.parse(article);
        const savedArticle = await storage.createNewsArticle(validatedArticle);
        articles.push(savedArticle);
      } catch (error) {
        console.error(`Error saving article: ${error}`);
      }
    }
    
    return articles;
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error);
    throw error;
  }
}

function extractRSSItems(xmlText: string) {
  const items = [];
  
  // Simple regex-based XML parsing for RSS items
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i;
  const descRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i;
  const linkRegex = /<link[^>]*>(.*?)<\/link>/i;
  const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/i;
  const imageRegex = /<enclosure[^>]*url="([^"]*)"[^>]*type="image[^"]*"|<media:thumbnail[^>]*url="([^"]*)"/i;
  
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    
    const titleMatch = titleRegex.exec(itemXml);
    const descMatch = descRegex.exec(itemXml);
    const linkMatch = linkRegex.exec(itemXml);
    const pubDateMatch = pubDateRegex.exec(itemXml);
    const imageMatch = imageRegex.exec(itemXml);
    
    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
      const link = linkMatch[1].trim();
      const imageUrl = imageMatch?.[1] || imageMatch?.[2] || null;
      
      let publishedAt = new Date();
      if (pubDateMatch) {
        const parsedDate = new Date(pubDateMatch[1]);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate;
        }
      }
      
      items.push({
        title: decodeHTMLEntities(title),
        description: decodeHTMLEntities(description),
        link,
        imageUrl,
        publishedAt,
      });
    }
  }
  
  return items;
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
  };
  
  return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all news articles
  app.get("/api/news", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const source = req.query.source as string;
      
      const articles = await storage.getNewsArticles(limit, offset, source);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });

  // Get RSS sources status
  app.get("/api/rss-sources", async (req, res) => {
    try {
      const sources = await storage.getRssSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RSS sources" });
    }
  });

  // Refresh RSS feeds
  app.post("/api/refresh-feeds", async (req, res) => {
    try {
      const sources = await storage.getRssSources();
      const results = [];
      
      for (const source of sources) {
        if (!source.isActive) continue;
        
        try {
          const articles = await parseRSSFeed(source.url, source.name);
          await storage.updateRssSource(source.id, {
            lastFetched: new Date(),
            status: "online"
          });
          
          results.push({
            source: source.name,
            status: "success",
            articlesCount: articles.length
          });
        } catch (error) {
          await storage.updateRssSource(source.id, {
            status: "error"
          });
          
          results.push({
            source: source.name,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
      
      res.json({ results, updatedAt: new Date() });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh feeds" });
    }
  });

  // Admin API routes for RSS source management
  app.post("/api/admin/rss-sources", async (req, res) => {
    try {
      const validatedSource = insertRssSourceSchema.parse(req.body);
      const newSource = await storage.createRssSource(validatedSource);
      res.status(201).json(newSource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create RSS source" });
      }
    }
  });

  app.put("/api/admin/rss-sources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedSource = await storage.updateRssSource(id, updateData);
      
      if (!updatedSource) {
        res.status(404).json({ message: "RSS source not found" });
        return;
      }
      
      res.json(updatedSource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update RSS source" });
    }
  });

  app.delete("/api/admin/rss-sources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRssSource(id);
      
      if (!deleted) {
        res.status(404).json({ message: "RSS source not found" });
        return;
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete RSS source" });
    }
  });

  // Auto-refresh feeds every 30 minutes
  const autoRefreshInterval = 30 * 60 * 1000; // 30 minutes
  setInterval(async () => {
    try {
      console.log("Auto-refreshing RSS feeds...");
      const sources = await storage.getRssSources();
      
      for (const source of sources) {
        if (!source.isActive) continue;
        
        try {
          await parseRSSFeed(source.url, source.name);
          await storage.updateRssSource(source.id, {
            lastFetched: new Date(),
            status: "online"
          });
        } catch (error) {
          console.error(`Failed to refresh ${source.name}:`, error);
          await storage.updateRssSource(source.id, {
            status: "error"
          });
        }
      }
    } catch (error) {
      console.error("Auto-refresh error:", error);
    }
  }, autoRefreshInterval);

  // Initial feed load
  setTimeout(async () => {
    console.log("Loading initial RSS feeds...");
    try {
      const response = await fetch("http://localhost:" + (process.env.PORT || "5000") + "/api/refresh-feeds", {
        method: "POST"
      });
      if (response.ok) {
        console.log("Initial RSS feeds loaded successfully");
      }
    } catch (error) {
      console.log("Initial RSS feed load will be attempted on first request");
    }
  }, 5000);

  const httpServer = createServer(app);
  return httpServer;
}
