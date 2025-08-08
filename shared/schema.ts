import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  link: text("link").notNull().unique(),
  source: varchar("source", { length: 50 }).notNull(), // matichon, tnn, honekrasae
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const rssSources = pgTable("rss_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").default(true),
  lastFetched: timestamp("last_fetched"),
  status: varchar("status", { length: 20 }).default("online"), // online, offline, error
});

export const weatherLocations = pgTable("weather_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(), // เช่น "อุดรธานี", "กรุงเทพฯ"
  nameEn: varchar("name_en", { length: 100 }).notNull(), // English name for API calls
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const weatherForecast = pgTable("weather_forecast", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull(),
  date: timestamp("date").notNull(),
  temperature: real("temperature"), // Celsius
  temperatureMin: real("temperature_min"),
  temperatureMax: real("temperature_max"),
  humidity: integer("humidity"), // Percentage
  pressure: real("pressure"), // hPa
  windSpeed: real("wind_speed"), // m/s
  windDirection: integer("wind_direction"), // degrees
  description: varchar("description", { length: 200 }),
  icon: varchar("icon", { length: 20 }),
  rainChance: integer("rain_chance"), // Percentage
  rainfall: real("rainfall"), // mm
  isHistorical: boolean("is_historical").default(false),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).pick({
  title: true,
  description: true,
  content: true,
  link: true,
  source: true,
  imageUrl: true,
  publishedAt: true,
});

export const insertRssSourceSchema = createInsertSchema(rssSources).pick({
  name: true,
  url: true,
  isActive: true,
});

export const insertWeatherLocationSchema = createInsertSchema(weatherLocations).pick({
  name: true,
  nameEn: true,
  latitude: true,
  longitude: true,
  isActive: true,
});

export const insertWeatherForecastSchema = createInsertSchema(weatherForecast).pick({
  locationId: true,
  date: true,
  temperature: true,
  temperatureMin: true,
  temperatureMax: true,
  humidity: true,
  pressure: true,
  windSpeed: true,
  windDirection: true,
  description: true,
  icon: true,
  rainChance: true,
  rainfall: true,
  isHistorical: true,
});

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertRssSource = z.infer<typeof insertRssSourceSchema>;
export type RssSource = typeof rssSources.$inferSelect;
export type InsertWeatherLocation = z.infer<typeof insertWeatherLocationSchema>;
export type WeatherLocation = typeof weatherLocations.$inferSelect;
export type InsertWeatherForecast = z.infer<typeof insertWeatherForecastSchema>;
export type WeatherForecast = typeof weatherForecast.$inferSelect;
