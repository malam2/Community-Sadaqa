import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  posts,
  reports,
  loginSchema,
  signupSchema,
  insertPostSchema,
  insertReportSchema,
} from "../shared/schema";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  // Support legacy SHA256 hashes during migration (they're 64 chars hex)
  if (hash.length === 64 && /^[a-f0-9]+$/i.test(hash)) {
    const crypto = await import("crypto");
    const sha256 = crypto.createHash("sha256").update(password).digest("hex");
    return sha256 === hash;
  }
  return bcrypt.compare(password, hash);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const result = signupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const { email, password, displayName } = result.data;

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));
      if (existing.length > 0) {
        return res
          .status(400)
          .json({ error: "An account with this email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const [user] = await db
        .insert(users)
        .values({
          email: email.toLowerCase(),
          password: hashedPassword,
          displayName,
        })
        .returning();

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          communityId: user.communityId,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const { email, password } = result.data;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          communityId: user.communityId,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Failed to login" });
    }
  });

  // Posts routes
  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const allPosts = await db
        .select({
          id: posts.id,
          communityId: posts.communityId,
          type: posts.type,
          category: posts.category,
          title: posts.title,
          description: posts.description,
          isAnonymous: posts.isAnonymous,
          authorId: posts.authorId,
          status: posts.status,
          urgent: posts.urgent,
          contactPreference: posts.contactPreference,
          contactPhone: posts.contactPhone,
          contactEmail: posts.contactEmail,
          createdAt: posts.createdAt,
          authorDisplayName: users.displayName,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.status, "open"))
        .orderBy(desc(posts.urgent), desc(posts.createdAt));

      return res.json(
        allPosts.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt).getTime(),
          authorDisplayName: p.isAnonymous ? undefined : p.authorDisplayName,
        })),
      );
    } catch (error) {
      console.error("Get posts error:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const userPosts = await db
        .select({
          id: posts.id,
          communityId: posts.communityId,
          type: posts.type,
          category: posts.category,
          title: posts.title,
          description: posts.description,
          isAnonymous: posts.isAnonymous,
          authorId: posts.authorId,
          status: posts.status,
          urgent: posts.urgent,
          contactPreference: posts.contactPreference,
          contactPhone: posts.contactPhone,
          contactEmail: posts.contactEmail,
          createdAt: posts.createdAt,
          authorDisplayName: users.displayName,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.authorId, userId))
        .orderBy(desc(posts.createdAt));

      return res.json(
        userPosts.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt).getTime(),
          authorDisplayName: p.isAnonymous ? undefined : p.authorDisplayName,
        })),
      );
    } catch (error) {
      console.error("Get user posts error:", error);
      return res.status(500).json({ error: "Failed to fetch user posts" });
    }
  });

  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      const { userId, ...postData } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = insertPostSchema.safeParse(postData);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const [newPost] = await db
        .insert(posts)
        .values({
          ...result.data,
          authorId: userId,
        })
        .returning();

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      return res.json({
        ...newPost,
        createdAt: new Date(newPost.createdAt).getTime(),
        authorDisplayName: newPost.isAnonymous ? undefined : user?.displayName,
      });
    } catch (error) {
      console.error("Create post error:", error);
      return res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.patch("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { userId, ...updates } = req.body;

      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.authorId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this post" });
      }

      const [updated] = await db
        .update(posts)
        .set(updates)
        .where(eq(posts.id, id))
        .returning();

      return res.json({
        ...updated,
        createdAt: new Date(updated.createdAt).getTime(),
      });
    } catch (error) {
      console.error("Update post error:", error);
      return res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { userId } = req.body;

      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.authorId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this post" });
      }

      await db.delete(reports).where(eq(reports.postId, id));
      await db.delete(posts).where(eq(posts.id, id));

      return res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      return res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Reports routes
  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const { userId, ...reportData } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = insertReportSchema.safeParse(reportData);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const [newReport] = await db
        .insert(reports)
        .values({
          ...result.data,
          reporterId: userId,
        })
        .returning();

      // Check if post has 3+ reports, if so hide it
      const reportCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(reports)
        .where(eq(reports.postId, result.data.postId));

      if (reportCount[0]?.count >= 3) {
        await db
          .update(posts)
          .set({ status: "hidden" })
          .where(eq(posts.id, result.data.postId));
      }

      return res.json(newReport);
    } catch (error) {
      console.error("Create report error:", error);
      return res.status(500).json({ error: "Failed to submit report" });
    }
  });

  // User routes
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { displayName } = req.body;

      const [updated] = await db
        .update(users)
        .set({ displayName })
        .where(eq(users.id, id))
        .returning();

      return res.json({
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
        communityId: updated.communityId,
      });
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({ error: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
