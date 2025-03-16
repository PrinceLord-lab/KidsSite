import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (Parents/Teachers and Children)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  isParent: boolean("is_parent").notNull().default(false),
  childAvatar: text("child_avatar"),
  childName: text("child_name"),
  parentId: integer("parent_id").references(() => users.id),
});

// Progress to track lessons completed
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(), // "alphabets", "numbers", "shapes"
  itemId: text("item_id").notNull(), // "A", "1", "circle"
  completed: boolean("completed").notNull().default(false),
  score: integer("score"), // Quiz score if applicable
  completedAt: timestamp("completed_at"),
});

// Activities to track recent activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(), // "alphabets", "numbers", "shapes" 
  activity: text("activity").notNull(), // "lesson", "quiz"
  itemId: text("item_id").notNull(), // "A", "1", "circle"
  score: integer("score"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert schema for users
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true })
  .extend({
    confirmPassword: z.string().optional()
  });

// Insert schema for progress
export const insertProgressSchema = createInsertSchema(progress)
  .omit({ id: true });

// Insert schema for activities
export const insertActivitySchema = createInsertSchema(activities)
  .omit({ id: true, timestamp: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
