import { type NewsArticle, type InsertNewsArticle, type RssSource, type InsertRssSource, newsArticles, rssSources } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // News Articles
  getNewsArticles(limit?: number, offset?: number, source?: string): Promise<NewsArticle[]>;
  getNewsArticleByLink(link: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: string, article: Partial<NewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: string): Promise<boolean>;
  
  // RSS Sources
  getRssSources(): Promise<RssSource[]>;
  getRssSourceById(id: string): Promise<RssSource | undefined>;
  createRssSource(source: InsertRssSource): Promise<RssSource>;
  updateRssSource(id: string, source: Partial<RssSource>): Promise<RssSource | undefined>;
  deleteRssSource(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // News Articles methods
  async getNewsArticles(limit = 50, offset = 0, source?: string): Promise<NewsArticle[]> {
    const baseQuery = db.select().from(newsArticles).orderBy(desc(newsArticles.publishedAt));
    
    if (source) {
      const results = await baseQuery.where(eq(newsArticles.source, source)).limit(limit).offset(offset);
      return results;
    }
    
    const results = await baseQuery.limit(limit).offset(offset);
    return results;
  }

  async getNewsArticleByLink(link: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.link, link));
    return article;
  }

  async createNewsArticle(insertArticle: InsertNewsArticle): Promise<NewsArticle> {
    const [article] = await db.insert(newsArticles).values(insertArticle).returning();
    return article;
  }

  async updateNewsArticle(id: string, updateData: Partial<NewsArticle>): Promise<NewsArticle | undefined> {
    const [updated] = await db.update(newsArticles)
      .set(updateData)
      .where(eq(newsArticles.id, id))
      .returning();
    return updated;
  }

  async deleteNewsArticle(id: string): Promise<boolean> {
    const result = await db.delete(newsArticles).where(eq(newsArticles.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // RSS Sources methods
  async getRssSources(): Promise<RssSource[]> {
    const sources = await db.select().from(rssSources);
    return sources;
  }

  async getRssSourceById(id: string): Promise<RssSource | undefined> {
    const [source] = await db.select().from(rssSources).where(eq(rssSources.id, id));
    return source;
  }

  async createRssSource(insertSource: InsertRssSource): Promise<RssSource> {
    const [source] = await db.insert(rssSources).values(insertSource).returning();
    return source;
  }

  async updateRssSource(id: string, updateData: Partial<RssSource>): Promise<RssSource | undefined> {
    const [updated] = await db.update(rssSources)
      .set(updateData)
      .where(eq(rssSources.id, id))
      .returning();
    return updated;
  }

  async deleteRssSource(id: string): Promise<boolean> {
    const result = await db.delete(rssSources).where(eq(rssSources.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Initialize default RSS sources if needed
async function initializeDefaultSources() {
  try {
    const existingSources = await db.select().from(rssSources);
    
    if (existingSources.length === 0) {
      const defaultSources: InsertRssSource[] = [
        {
          name: "Matichon",
          url: "https://www.matichon.co.th/rss/news",
          isActive: true,
        },
        {
          name: "TNN",
          url: "https://www.tnnthailand.com/rss.xml",
          isActive: true,
        },
        {
          name: "Honekrasae",
          url: "https://www.honekrasae.com/rss",
          isActive: true,
        },
      ];

      await db.insert(rssSources).values(defaultSources);
      console.log("Default RSS sources initialized");
    }
  } catch (error) {
    console.error("Failed to initialize default RSS sources:", error);
  }
}

export const storage = new DatabaseStorage();

// Initialize default sources on startup
initializeDefaultSources();
