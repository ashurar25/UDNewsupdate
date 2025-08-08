
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './db';

async function runMigrations() {
  try {
    console.log('กำลังสร้างตารางในฐานข้อมูล...');
    
    // สร้างตาราง news_articles
    await db.execute(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        link TEXT NOT NULL UNIQUE,
        source VARCHAR(50) NOT NULL,
        image_url TEXT,
        published_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
    `);
    
    // สร้างตาราง rss_sources
    await db.execute(`
      CREATE TABLE IF NOT EXISTS rss_sources (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_fetched TIMESTAMP,
        status VARCHAR(20) DEFAULT 'online'
      );
    `);
    
    // สร้าง unique constraint สำหรับ url
    await db.execute(`
      ALTER TABLE rss_sources ADD CONSTRAINT rss_sources_url_unique UNIQUE (url);
    `);
    
    // เพิ่มข้อมูล RSS sources เริ่มต้น
    await db.execute(`
      INSERT INTO rss_sources (name, url, is_active) 
      SELECT 'Matichon', 'https://www.matichon.co.th/rss/news', true
      WHERE NOT EXISTS (SELECT 1 FROM rss_sources WHERE url = 'https://www.matichon.co.th/rss/news');
    `);
    
    await db.execute(`
      INSERT INTO rss_sources (name, url, is_active) 
      SELECT 'TNN Thailand', 'https://www.tnnthailand.com/rss.xml', true
      WHERE NOT EXISTS (SELECT 1 FROM rss_sources WHERE url = 'https://www.tnnthailand.com/rss.xml');
    `);
    
    await db.execute(`
      INSERT INTO rss_sources (name, url, is_active) 
      SELECT 'Honekrasae', 'https://www.honekrasae.com/rss', true
      WHERE NOT EXISTS (SELECT 1 FROM rss_sources WHERE url = 'https://www.honekrasae.com/rss');
    `);
    
    console.log('สร้างตารางและเพิ่มข้อมูลเริ่มต้นเสร็จแล้ว');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างตาราง:', error);
  }
}

runMigrations();
