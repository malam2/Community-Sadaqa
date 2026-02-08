import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// Use env var or generate a random secret (logged on startup for dev)
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  const crypto = require("crypto");
  const secret = crypto.randomBytes(32).toString("hex");
  if (process.env.NODE_ENV !== "production") {
    console.log("⚠️  No JWT_SECRET set — using random secret (sessions won't persist across restarts)");
  } else {
    console.error("❌ CRITICAL: JWT_SECRET environment variable must be set in production!");
    process.exit(1);
  }
  return secret;
})();

const JWT_EXPIRY = "7d"; // Token valid for 7 days

export interface JwtPayload {
  userId: string;
  email: string;
}

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email } as JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Middleware to require authentication.
 * Extracts the JWT from the Authorization header (Bearer token)
 * and attaches userId and userEmail to the request.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Optional auth middleware — extracts user if token present, but doesn't require it.
 * Useful for endpoints that work for both authenticated and anonymous users.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const payload = verifyToken(token);
      req.userId = payload.userId;
      req.userEmail = payload.email;
    } catch {
      // Invalid token — just continue without auth
    }
  }

  next();
}
