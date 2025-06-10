import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(), // assuming UUID or string-based ID
  description: text("description").notNull(),
  date: text("date").notNull(), // could be ISO date string
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull(),
  isCompleted: integer("isCompleted", { mode: "boolean" }).notNull(),
  notificationId: text("notification_id").notNull(),
  notificationMinutesBefore: integer("notification_minutes_before"), // optional
});
