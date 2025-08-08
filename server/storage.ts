import { type NewsArticle, type InsertNewsArticle, type RssSource, type InsertRssSource, type WeatherLocation, type InsertWeatherLocation, type WeatherForecast, type InsertWeatherForecast, newsArticles, rssSources, weatherLocations, weatherForecast } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

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
  
  // Weather Locations
  getWeatherLocations(): Promise<WeatherLocation[]>;
  getWeatherLocationById(id: string): Promise<WeatherLocation | undefined>;
  createWeatherLocation(location: InsertWeatherLocation): Promise<WeatherLocation>;
  updateWeatherLocation(id: string, location: Partial<WeatherLocation>): Promise<WeatherLocation | undefined>;
  deleteWeatherLocation(id: string): Promise<boolean>;
  
  // Weather Forecast
  getWeatherForecast(locationId: string, startDate?: Date, endDate?: Date, isHistorical?: boolean): Promise<WeatherForecast[]>;
  getWeatherForecastById(id: string): Promise<WeatherForecast | undefined>;
  createWeatherForecast(forecast: InsertWeatherForecast): Promise<WeatherForecast>;
  updateWeatherForecast(id: string, forecast: Partial<WeatherForecast>): Promise<WeatherForecast | undefined>;
  deleteWeatherForecast(id: string): Promise<boolean>;
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

  // Weather Locations methods
  async getWeatherLocations(): Promise<WeatherLocation[]> {
    const locations = await db.select().from(weatherLocations).where(eq(weatherLocations.isActive, true));
    return locations;
  }

  async getWeatherLocationById(id: string): Promise<WeatherLocation | undefined> {
    const [location] = await db.select().from(weatherLocations).where(eq(weatherLocations.id, id));
    return location;
  }

  async createWeatherLocation(insertLocation: InsertWeatherLocation): Promise<WeatherLocation> {
    const [location] = await db.insert(weatherLocations).values(insertLocation).returning();
    return location;
  }

  async updateWeatherLocation(id: string, updateData: Partial<WeatherLocation>): Promise<WeatherLocation | undefined> {
    const [updated] = await db.update(weatherLocations)
      .set(updateData)
      .where(eq(weatherLocations.id, id))
      .returning();
    return updated;
  }

  async deleteWeatherLocation(id: string): Promise<boolean> {
    const result = await db.delete(weatherLocations).where(eq(weatherLocations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Weather Forecast methods
  async getWeatherForecast(locationId: string, startDate?: Date, endDate?: Date, isHistorical?: boolean): Promise<WeatherForecast[]> {
    const conditions = [eq(weatherForecast.locationId, locationId)];
    
    if (startDate) {
      conditions.push(gte(weatherForecast.date, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(weatherForecast.date, endDate));
    }
    
    if (isHistorical !== undefined) {
      conditions.push(eq(weatherForecast.isHistorical, isHistorical));
    }

    const results = await db.select().from(weatherForecast)
      .where(and(...conditions))
      .orderBy(desc(weatherForecast.date))
      .limit(30);
      
    return results;
  }

  async getWeatherForecastById(id: string): Promise<WeatherForecast | undefined> {
    const [forecast] = await db.select().from(weatherForecast).where(eq(weatherForecast.id, id));
    return forecast;
  }

  async createWeatherForecast(insertForecast: InsertWeatherForecast): Promise<WeatherForecast> {
    const [forecast] = await db.insert(weatherForecast).values(insertForecast).returning();
    return forecast;
  }

  async updateWeatherForecast(id: string, updateData: Partial<WeatherForecast>): Promise<WeatherForecast | undefined> {
    const [updated] = await db.update(weatherForecast)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(weatherForecast.id, id))
      .returning();
    return updated;
  }

  async deleteWeatherForecast(id: string): Promise<boolean> {
    const result = await db.delete(weatherForecast).where(eq(weatherForecast.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Initialize default RSS sources and weather locations if needed
async function initializeDefaults() {
  try {
    // Initialize RSS sources
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

    // Initialize weather locations
    const existingLocations = await db.select().from(weatherLocations);
    
    if (existingLocations.length === 0) {
      const defaultLocations: InsertWeatherLocation[] = [
        {
          name: "อุดรธานี",
          nameEn: "Udon Thani",
          latitude: 17.4138,
          longitude: 102.7892,
          isActive: true,
        },
        {
          name: "กรุงเทพมหานคร",
          nameEn: "Bangkok",
          latitude: 13.7563,
          longitude: 100.5018,
          isActive: true,
        },
        {
          name: "เชียงใหม่",
          nameEn: "Chiang Mai",
          latitude: 18.7883,
          longitude: 98.9853,
          isActive: true,
        },
      ];

      await db.insert(weatherLocations).values(defaultLocations);
      console.log("Default weather locations initialized");
    }
  } catch (error) {
    console.error("Failed to initialize defaults:", error);
  }
}

export const storage = new DatabaseStorage();

// Initialize defaults on startup
initializeDefaults();
