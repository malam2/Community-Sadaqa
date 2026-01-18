import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
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
  // Location fields
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  locationRadius: integer("location_radius").default(10), // miles
  // Twilio proxy phone number (assigned per user for privacy)
  twilioProxyNumber: text("twilio_proxy_number"),
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
  authorId: varchar("author_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("open"), // 'open' | 'fulfilled' | 'hidden'
  urgent: boolean("urgent").notNull().default(false),
  contactPreference: text("contact_preference").notNull().default("in_app"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  // Location fields
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  // Exchange type - goods preferred over money
  exchangeType: text("exchange_type").default("goods"), // 'goods' | 'money' | 'either' | 'service'
  exchangeNotes: text("exchange_notes"), // Explanation if money is needed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Conversations between users (privacy-preserving via Twilio)
export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: varchar("post_id")
    .notNull()
    .references(() => posts.id),
  // Participant 1 is the post author
  participant1Id: varchar("participant1_id")
    .notNull()
    .references(() => users.id),
  // Participant 2 is the helper/requester reaching out
  participant2Id: varchar("participant2_id")
    .notNull()
    .references(() => users.id),
  // Twilio session identifier for this conversation
  twilioSessionSid: text("twilio_session_sid"),
  // Meeting details once agreed
  meetingLocation: text("meeting_location"),
  meetingAddress: text("meeting_address"),
  meetingLatitude: doublePrecision("meeting_latitude"),
  meetingLongitude: doublePrecision("meeting_longitude"),
  meetingTime: timestamp("meeting_time"),
  meetingNotes: text("meeting_notes"),
  // Status tracking
  status: text("status").notNull().default("active"), // 'active' | 'meeting_set' | 'completed' | 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages in a conversation (stored for reference, routed via Twilio)
export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id")
    .notNull()
    .references(() => conversations.id),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  // Twilio message SID for tracking
  twilioMessageSid: text("twilio_message_sid"),
  // Read status
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: varchar("post_id")
    .notNull()
    .references(() => posts.id),
  reporterId: varchar("reporter_id")
    .notNull()
    .references(() => users.id),
  reason: text("reason").notNull(), // 'scam' | 'illegal' | 'harassment' | 'other'
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  displayName: true,
});

// Extended signup schema with optional location
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(50),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationRadius: z.number().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateUserLocationSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationRadius: z.number().min(1).max(100).optional(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  authorId: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const setMeetingSchema = z.object({
  conversationId: z.string(),
  meetingLocation: z.string().min(1, "Please provide a meeting location name"),
  meetingAddress: z.string().optional(),
  meetingLatitude: z.number().optional(),
  meetingLongitude: z.number().optional(),
  meetingTime: z.string().datetime().optional(),
  meetingNotes: z.string().optional(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  reporterId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Report = typeof reports.$inferSelect;
