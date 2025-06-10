// db/initDb.ts
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

// Create a singleton database instance
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDatabaseInstance() {
  if (!dbInstance) {
    const expo = openDatabaseSync("todo.db", { useNewConnection: true });
    dbInstance = drizzle(expo);
  }
  return dbInstance;
}

export async function initializeDatabase() {
  console.log("Initializing database...");

  try {
    const db = getDatabaseInstance();

    // Check if the tasks table exists
    const tableExists = await db.get(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='tasks'
    `);

    if (!tableExists) {
      console.log("Tasks table does not exist, creating it...");

      // Create the tasks table matching your exact schema
      await db.run(sql`
        CREATE TABLE tasks (
          id TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          date TEXT NOT NULL,
          priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
          isCompleted INTEGER NOT NULL,
          notification_id TEXT NOT NULL,
          notification_minutes_before INTEGER
        )
      `);

      console.log("Tasks table created successfully!");
    } else {
      console.log("Tasks table already exists");
    }

    // Verify table structure
    const tableInfo = await db.all(sql`PRAGMA table_info(tasks)`);
    console.log("Table structure:", tableInfo);

    return db;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

// Helper function to check database health
export async function checkDatabaseHealth() {
  try {
    const db = getDatabaseInstance();

    // Try a simple query
    const result = await db.get(sql`SELECT COUNT(*) as count FROM tasks`);
    console.log("Database health check passed. Task count:", result);
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
