import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { eq, desc, and, sql, gte, lte, or } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  posts,
  reports,
  conversations,
  messages,
  loginSchema,
  signupSchema,
  insertPostSchema,
  insertReportSchema,
  updateUserLocationSchema,
  insertMessageSchema,
  setMeetingSchema,
} from "../shared/schema";
import bcrypt from "bcryptjs";
import {
  calculateDistance,
  getBoundingBox,
  DEFAULT_RADIUS,
} from "./services/geolocation";
import {
  isTwilioConfigured,
  createMockMessageSid,
  getSuggestedMeetingPlaces,
  getMeetupSafetyTips,
} from "./services/twilio";

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

      const {
        email,
        password,
        displayName,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        locationRadius,
      } = result.data;

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
          city,
          state,
          zipCode,
          latitude,
          longitude,
          locationRadius: locationRadius ?? DEFAULT_RADIUS,
        })
        .returning();

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          communityId: user.communityId,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          latitude: user.latitude,
          longitude: user.longitude,
          locationRadius: user.locationRadius,
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
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          latitude: user.latitude,
          longitude: user.longitude,
          locationRadius: user.locationRadius,
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
      // Extract location filters from query params
      const userLat = req.query.lat ? parseFloat(req.query.lat as string) : null;
      const userLng = req.query.lng ? parseFloat(req.query.lng as string) : null;
      const radius = req.query.radius
        ? parseFloat(req.query.radius as string)
        : DEFAULT_RADIUS;

      // Build base query with location fields
      let query = db
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
          city: posts.city,
          state: posts.state,
          zipCode: posts.zipCode,
          latitude: posts.latitude,
          longitude: posts.longitude,
          exchangeType: posts.exchangeType,
          exchangeNotes: posts.exchangeNotes,
          createdAt: posts.createdAt,
          authorDisplayName: users.displayName,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.status, "open"))
        .orderBy(desc(posts.urgent), desc(posts.createdAt));

      let allPosts = await query;

      // Apply proximity filter if user location provided
      if (userLat !== null && userLng !== null) {
        allPosts = allPosts.filter((p) => {
          // Include posts without location (community-wide)
          if (p.latitude === null || p.longitude === null) {
            return true;
          }
          const distance = calculateDistance(
            userLat,
            userLng,
            p.latitude,
            p.longitude,
          );
          return distance <= radius;
        });
      }

      return res.json(
        allPosts.map((p) => {
          // Calculate distance if user location provided
          let distance: number | undefined;
          if (
            userLat !== null &&
            userLng !== null &&
            p.latitude !== null &&
            p.longitude !== null
          ) {
            distance = calculateDistance(userLat, userLng, p.latitude, p.longitude);
          }

          return {
            ...p,
            createdAt: new Date(p.createdAt).getTime(),
            authorDisplayName: p.isAnonymous ? undefined : p.authorDisplayName,
            distance,
          };
        }),
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
      const { displayName, city, state, zipCode, latitude, longitude, locationRadius } = req.body;

      // Validate location update if provided
      if (city || state || zipCode || latitude || longitude || locationRadius) {
        const locationResult = updateUserLocationSchema.safeParse({
          city,
          state,
          zipCode,
          latitude,
          longitude,
          locationRadius,
        });
        if (!locationResult.success) {
          return res.status(400).json({ error: locationResult.error.issues[0].message });
        }
      }

      const [updated] = await db
        .update(users)
        .set({
          displayName,
          city,
          state,
          zipCode,
          latitude,
          longitude,
          locationRadius,
        })
        .where(eq(users.id, id))
        .returning();

      return res.json({
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
        communityId: updated.communityId,
        city: updated.city,
        state: updated.state,
        zipCode: updated.zipCode,
        latitude: updated.latitude,
        longitude: updated.longitude,
        locationRadius: updated.locationRadius,
      });
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({ error: "Failed to update user" });
    }
  });

  // ============================================
  // Conversation & Messaging Routes
  // ============================================

  // Get meeting place suggestions and safety tips
  app.get("/api/meeting-info", async (_req: Request, res: Response) => {
    return res.json({
      suggestedPlaces: getSuggestedMeetingPlaces(),
      safetyTips: getMeetupSafetyTips(),
      twilioEnabled: isTwilioConfigured(),
    });
  });

  // Start a new conversation about a post
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { userId, postId } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get the post
      const [post] = await db.select().from(posts).where(eq(posts.id, postId));
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Can't start conversation with yourself
      if (post.authorId === userId) {
        return res.status(400).json({ error: "Cannot start conversation with yourself" });
      }

      // Check if conversation already exists
      const existing = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.postId, postId),
            eq(conversations.participant2Id, userId),
          ),
        );

      if (existing.length > 0) {
        // Return existing conversation
        return res.json(existing[0]);
      }

      // Create new conversation
      const [conversation] = await db
        .insert(conversations)
        .values({
          postId,
          participant1Id: post.authorId,
          participant2Id: userId,
          status: "active",
        })
        .returning();

      return res.json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      return res.status(500).json({ error: "Failed to start conversation" });
    }
  });

  // Get user's conversations
  app.get("/api/conversations/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;

      // Get conversations where user is either participant
      const userConversations = await db
        .select({
          id: conversations.id,
          postId: conversations.postId,
          participant1Id: conversations.participant1Id,
          participant2Id: conversations.participant2Id,
          twilioSessionSid: conversations.twilioSessionSid,
          meetingLocation: conversations.meetingLocation,
          meetingAddress: conversations.meetingAddress,
          meetingTime: conversations.meetingTime,
          meetingNotes: conversations.meetingNotes,
          status: conversations.status,
          createdAt: conversations.createdAt,
          updatedAt: conversations.updatedAt,
          postTitle: posts.title,
          postType: posts.type,
        })
        .from(conversations)
        .leftJoin(posts, eq(conversations.postId, posts.id))
        .where(
          or(
            eq(conversations.participant1Id, userId),
            eq(conversations.participant2Id, userId),
          ),
        )
        .orderBy(desc(conversations.updatedAt));

      // Get display names for other participants
      const conversationsWithParticipants = await Promise.all(
        userConversations.map(async (conv) => {
          const otherUserId =
            conv.participant1Id === userId
              ? conv.participant2Id
              : conv.participant1Id;
          const [otherUser] = await db
            .select({ displayName: users.displayName })
            .from(users)
            .where(eq(users.id, otherUserId));

          // Get last message
          const [lastMessage] = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conv.id))
            .orderBy(desc(messages.createdAt))
            .limit(1);

          // Get unread count
          const unreadCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, conv.id),
                eq(messages.isRead, false),
                sql`${messages.senderId} != ${userId}`,
              ),
            );

          return {
            ...conv,
            createdAt: new Date(conv.createdAt).getTime(),
            updatedAt: new Date(conv.updatedAt).getTime(),
            meetingTime: conv.meetingTime
              ? new Date(conv.meetingTime).getTime()
              : null,
            otherParticipantName: otherUser?.displayName ?? "Unknown",
            lastMessage: lastMessage
              ? {
                  content: lastMessage.content,
                  createdAt: new Date(lastMessage.createdAt).getTime(),
                  isFromMe: lastMessage.senderId === userId,
                }
              : null,
            unreadCount: Number(unreadCount[0]?.count ?? 0),
          };
        }),
      );

      return res.json(conversationsWithParticipants);
    } catch (error) {
      console.error("Get conversations error:", error);
      return res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get(
    "/api/conversations/:conversationId/messages",
    async (req: Request, res: Response) => {
      try {
        const conversationId = req.params.conversationId as string;
        const userId = req.query.userId as string;

        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify user is participant
        const [conversation] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversationId));

        if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
        }

        if (
          conversation.participant1Id !== userId &&
          conversation.participant2Id !== userId
        ) {
          return res
            .status(403)
            .json({ error: "Not authorized to view this conversation" });
        }

        // Get messages
        const conversationMessages = await db
          .select({
            id: messages.id,
            conversationId: messages.conversationId,
            senderId: messages.senderId,
            content: messages.content,
            isRead: messages.isRead,
            createdAt: messages.createdAt,
            senderName: users.displayName,
          })
          .from(messages)
          .leftJoin(users, eq(messages.senderId, users.id))
          .where(eq(messages.conversationId, conversationId))
          .orderBy(messages.createdAt);

        // Mark messages as read
        await db
          .update(messages)
          .set({ isRead: true })
          .where(
            and(
              eq(messages.conversationId, conversationId),
              sql`${messages.senderId} != ${userId}`,
            ),
          );

        return res.json(
          conversationMessages.map((m) => ({
            ...m,
            createdAt: new Date(m.createdAt).getTime(),
            isFromMe: m.senderId === userId,
          })),
        );
      } catch (error) {
        console.error("Get messages error:", error);
        return res.status(500).json({ error: "Failed to fetch messages" });
      }
    },
  );

  // Send a message
  app.post(
    "/api/conversations/:conversationId/messages",
    async (req: Request, res: Response) => {
      try {
        const conversationId = req.params.conversationId as string;
        const { userId, content } = req.body;

        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        if (!content || content.trim().length === 0) {
          return res.status(400).json({ error: "Message cannot be empty" });
        }

        // Verify user is participant
        const [conversation] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversationId));

        if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
        }

        if (
          conversation.participant1Id !== userId &&
          conversation.participant2Id !== userId
        ) {
          return res
            .status(403)
            .json({ error: "Not authorized to send messages in this conversation" });
        }

        // Create message with mock SID (or real Twilio SID if configured)
        const twilioMessageSid = createMockMessageSid();

        const [message] = await db
          .insert(messages)
          .values({
            conversationId,
            senderId: userId,
            content: content.trim(),
            twilioMessageSid,
          })
          .returning();

        // Update conversation timestamp
        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, conversationId));

        // Get sender name
        const [sender] = await db
          .select({ displayName: users.displayName })
          .from(users)
          .where(eq(users.id, userId));

        return res.json({
          ...message,
          createdAt: new Date(message.createdAt).getTime(),
          senderName: sender?.displayName,
          isFromMe: true,
        });
      } catch (error) {
        console.error("Send message error:", error);
        return res.status(500).json({ error: "Failed to send message" });
      }
    },
  );

  // Set meeting details for a conversation
  app.patch(
    "/api/conversations/:conversationId/meeting",
    async (req: Request, res: Response) => {
      try {
        const conversationId = req.params.conversationId as string;
        const { userId, ...meetingData } = req.body;

        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify user is participant
        const [conversation] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversationId));

        if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
        }

        if (
          conversation.participant1Id !== userId &&
          conversation.participant2Id !== userId
        ) {
          return res
            .status(403)
            .json({ error: "Not authorized to update this conversation" });
        }

        const result = setMeetingSchema.omit({ conversationId: true }).safeParse(meetingData);
        if (!result.success) {
          return res.status(400).json({ error: result.error.issues[0].message });
        }

        const [updated] = await db
          .update(conversations)
          .set({
            ...result.data,
            meetingTime: result.data.meetingTime
              ? new Date(result.data.meetingTime)
              : undefined,
            status: "meeting_set",
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, conversationId))
          .returning();

        return res.json({
          ...updated,
          createdAt: new Date(updated.createdAt).getTime(),
          updatedAt: new Date(updated.updatedAt).getTime(),
          meetingTime: updated.meetingTime
            ? new Date(updated.meetingTime).getTime()
            : null,
        });
      } catch (error) {
        console.error("Set meeting error:", error);
        return res.status(500).json({ error: "Failed to set meeting details" });
      }
    },
  );

  // Mark conversation as complete
  app.patch(
    "/api/conversations/:conversationId/complete",
    async (req: Request, res: Response) => {
      try {
        const conversationId = req.params.conversationId as string;
        const { userId } = req.body;

        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify user is participant
        const [conversation] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversationId));

        if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
        }

        if (
          conversation.participant1Id !== userId &&
          conversation.participant2Id !== userId
        ) {
          return res
            .status(403)
            .json({ error: "Not authorized to update this conversation" });
        }

        const [updated] = await db
          .update(conversations)
          .set({
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, conversationId))
          .returning();

        return res.json({
          ...updated,
          createdAt: new Date(updated.createdAt).getTime(),
          updatedAt: new Date(updated.updatedAt).getTime(),
        });
      } catch (error) {
        console.error("Complete conversation error:", error);
        return res.status(500).json({ error: "Failed to complete conversation" });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}
