import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  communityId: text("community_id").notNull().default("local_ummah"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  communityId: text("community_id").notNull().default("local_ummah"),
  type: text("type").notNull(), // 'request' | 'offer'
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  authorId: varchar("author_id").notNull().references(() => users.id),
  status: text("status").notNull().default("open"), // 'open' | 'fulfilled' | 'hidden'
  urgent: boolean("urgent").notNull().default(false),
  contactPreference: text("contact_preference").notNull().default("in_app"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reason: text("reason").notNull(), // 'scam' | 'illegal' | 'harassment' | 'other'
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  displayName: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(50),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  authorId: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  reporterId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Report = typeof reports.$inferSelect;
