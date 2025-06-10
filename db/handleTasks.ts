// db/handleTasks.ts
import { Task } from "@/types/types";
import { eq } from "drizzle-orm";
import { getDatabaseInstance } from "./initDb";
import { tasks } from "./schema";

export async function loadTasksFromDb() {
  try {
    const db = getDatabaseInstance();

    const dbTasks = await db.select().from(tasks);

    console.log(`Successfully loaded ${dbTasks.length} tasks from database`);
    return dbTasks;
  } catch (error) {
    console.error("Failed to load tasks from database:", error);
    throw error;
  }
}

// Add other task-related database functions here using the same pattern
export async function saveTaskToDb(task: Task) {
  try {
    const db = getDatabaseInstance();

    await db.insert(tasks).values({
      id: task.id,
      description: task.desc,
      date: task.date,
      priority: task.priority,
      isCompleted: task.isCompleted,
      notificationId: task.notificationId,
      notificationMinutesBefore: task.notificationMinutesBefore ?? null,
    });

    console.log("Task saved successfully:", task.id);
  } catch (error) {
    console.error("Failed to save task:", error);
    throw error;
  }
}

export async function updateTaskInDb(task: Task) {
  try {
    const db = getDatabaseInstance();

    await db
      .update(tasks)
      .set({
        description: task.desc,
        date: task.date,
        priority: task.priority,
        isCompleted: task.isCompleted,
        notificationId: task.notificationId,
        notificationMinutesBefore: task.notificationMinutesBefore,
      })
      .where(eq(tasks.id, task.id));

    console.log("Task updated successfully:", task.id);
  } catch (error) {
    console.error("Failed to update task:", error);
    throw error;
  }
}

export async function deleteTaskFromDb(taskId: string) {
  try {
    const db = getDatabaseInstance();

    await db.delete(tasks).where(eq(tasks.id, taskId));

    console.log("Task deleted successfully:", taskId);
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw error;
  }
}

export async function clearCompletedTasksFromDb() {
  try {
    const db = getDatabaseInstance();

    await db.delete(tasks).where(eq(tasks.isCompleted, true));

    console.log("Completed tasks cleared successfully");
  } catch (error) {
    console.error("Failed to clear completed tasks:", error);
    throw error;
  }
}

export async function markTaskAsCompletedInDb(taskId: string) {
  try {
    const db = getDatabaseInstance();

    await db
      .update(tasks)
      .set({ isCompleted: true })
      .where(eq(tasks.id, taskId));

    console.log("Task marked as completed:", taskId);
  } catch (error) {
    console.error("Failed to mark task as completed:", error);
    throw error;
  }
}
