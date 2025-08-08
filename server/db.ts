import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection with failover support
const createConnection = () => {
  const primaryUrl = process.env.DATABASE_URL;
  const backupUrl = process.env.BACKUP_DATABASE_URL;
  
  try {
    // Try primary database first
    const primaryPool = new Pool({ connectionString: primaryUrl });
    console.log("Using primary database");
    return { pool: primaryPool, db: drizzle({ client: primaryPool, schema }) };
  } catch (error) {
    console.log("Primary database failed, trying backup:", error);
    
    if (backupUrl) {
      try {
        const backupPool = new Pool({ connectionString: backupUrl });
        console.log("Using backup database");
        return { pool: backupPool, db: drizzle({ client: backupPool, schema }) };
      } catch (backupError) {
        console.log("Backup database also failed:", backupError);
        throw new Error("Both primary and backup databases are unavailable");
      }
    } else {
      throw new Error("Primary database failed and no backup configured");
    }
  }
};

const connection = createConnection();
export const pool = connection.pool;
export const db = connection.db;