import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
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

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertRssSource = z.infer<typeof insertRssSourceSchema>;
export type RssSource = typeof rssSources.$inferSelect;
