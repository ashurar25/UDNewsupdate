import { type NewsArticle, type InsertNewsArticle, type RssSource, type InsertRssSource } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private newsArticles: Map<string, NewsArticle>;
  private rssSources: Map<string, RssSource>;

  constructor() {
    this.newsArticles = new Map();
    this.rssSources = new Map();
    
    // Initialize default RSS sources
    this.initializeRssSources();
  }

  private initializeRssSources() {
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

    for (const source of defaultSources) {
      this.createRssSource(source);
    }
  }

  // News Articles methods
  async getNewsArticles(limit = 50, offset = 0, source?: string): Promise<NewsArticle[]> {
    let articles = Array.from(this.newsArticles.values());
    
    if (source) {
      articles = articles.filter(article => article.source === source);
    }
    
    // Sort by publishedAt descending
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return articles.slice(offset, offset + limit);
  }

  async getNewsArticleByLink(link: string): Promise<NewsArticle | undefined> {
    return Array.from(this.newsArticles.values()).find(article => article.link === link);
  }

  async createNewsArticle(insertArticle: InsertNewsArticle): Promise<NewsArticle> {
    const id = randomUUID();
    const article: NewsArticle = {
      ...insertArticle,
      id,
      content: insertArticle.content || null,
      description: insertArticle.description || null,
      imageUrl: insertArticle.imageUrl || null,
      createdAt: new Date(),
    };
    this.newsArticles.set(id, article);
    return article;
  }

  async updateNewsArticle(id: string, updateData: Partial<NewsArticle>): Promise<NewsArticle | undefined> {
    const existing = this.newsArticles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.newsArticles.set(id, updated);
    return updated;
  }

  async deleteNewsArticle(id: string): Promise<boolean> {
    return this.newsArticles.delete(id);
  }

  // RSS Sources methods
  async getRssSources(): Promise<RssSource[]> {
    return Array.from(this.rssSources.values());
  }

  async getRssSourceById(id: string): Promise<RssSource | undefined> {
    return this.rssSources.get(id);
  }

  async createRssSource(insertSource: InsertRssSource): Promise<RssSource> {
    const id = randomUUID();
    const source: RssSource = {
      ...insertSource,
      id,
      isActive: insertSource.isActive ?? true,
      lastFetched: null,
      status: "online",
    };
    this.rssSources.set(id, source);
    return source;
  }

  async updateRssSource(id: string, updateData: Partial<RssSource>): Promise<RssSource | undefined> {
    const existing = this.rssSources.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.rssSources.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
