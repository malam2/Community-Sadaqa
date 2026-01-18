/**
 * Twilio Service - Privacy-Preserving Communication
 *
 * This service handles all Twilio interactions for the Community Sadaqa app.
 * It uses Twilio's Proxy service to allow users to communicate without
 * exposing their real phone numbers.
 *
 * Setup required:
 * 1. Create a Twilio account and get Account SID + Auth Token
 * 2. Create a Proxy Service in Twilio Console
 * 3. Add phone numbers to the Proxy Service's number pool
 * 4. Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PROXY_SERVICE_SID
 */

import Twilio from "twilio";

// Environment variables (should be set in .env)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PROXY_SERVICE_SID = process.env.TWILIO_PROXY_SERVICE_SID;
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

// Check if Twilio is configured
export const isTwilioConfigured = (): boolean => {
  return !!(
    TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    (TWILIO_PROXY_SERVICE_SID || TWILIO_MESSAGING_SERVICE_SID)
  );
};

// Initialize Twilio client (lazy initialization)
let twilioClient: Twilio.Twilio | null = null;

const getClient = (): Twilio.Twilio => {
  if (!twilioClient) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error(
        "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.",
      );
    }
    twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

/**
 * Create a new Proxy session for a conversation between two users
 * Returns the session SID which should be stored with the conversation
 */
export async function createProxySession(
  conversationId: string,
  participant1Phone: string,
  participant2Phone: string,
): Promise<{
  sessionSid: string;
  participant1ProxyNumber: string;
  participant2ProxyNumber: string;
}> {
  if (!TWILIO_PROXY_SERVICE_SID) {
    throw new Error("TWILIO_PROXY_SERVICE_SID not configured");
  }

  const client = getClient();

  // Create a new session
  const session = await client.proxy.v1
    .services(TWILIO_PROXY_SERVICE_SID)
    .sessions.create({
      uniqueName: `conversation-${conversationId}`,
      mode: "message-only", // Only allow messaging, not calls
      ttl: 60 * 60 * 24 * 30, // 30 days TTL
    });

  // Add participant 1
  const p1 = await client.proxy.v1
    .services(TWILIO_PROXY_SERVICE_SID)
    .sessions(session.sid)
    .participants.create({
      identifier: participant1Phone,
      friendlyName: "Post Author",
    });

  // Add participant 2
  const p2 = await client.proxy.v1
    .services(TWILIO_PROXY_SERVICE_SID)
    .sessions(session.sid)
    .participants.create({
      identifier: participant2Phone,
      friendlyName: "Helper",
    });

  return {
    sessionSid: session.sid,
    participant1ProxyNumber: p1.proxyIdentifier,
    participant2ProxyNumber: p2.proxyIdentifier,
  };
}

/**
 * Alternative: Send a message using Twilio Messaging Service
 * This is simpler than Proxy but provides less privacy protection
 * Use this as a fallback if Proxy is not set up
 */
export async function sendMessage(
  to: string,
  body: string,
  from?: string,
): Promise<string> {
  const client = getClient();

  const messageOptions: {
    to: string;
    body: string;
    from?: string;
    messagingServiceSid?: string;
  } = {
    to,
    body,
  };

  if (TWILIO_MESSAGING_SERVICE_SID) {
    messageOptions.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  } else if (from) {
    messageOptions.from = from;
  } else {
    throw new Error(
      "Either TWILIO_MESSAGING_SERVICE_SID or a from number must be provided",
    );
  }

  const message = await client.messages.create(messageOptions);
  return message.sid;
}

/**
 * Send an in-app notification message (for in-app messaging fallback)
 * When Twilio is not configured, we'll store messages in the database
 * and this function returns a mock SID
 */
export function createMockMessageSid(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Close a Proxy session when conversation is complete
 */
export async function closeProxySession(sessionSid: string): Promise<void> {
  if (!TWILIO_PROXY_SERVICE_SID) {
    throw new Error("TWILIO_PROXY_SERVICE_SID not configured");
  }

  const client = getClient();

  await client.proxy.v1
    .services(TWILIO_PROXY_SERVICE_SID)
    .sessions(sessionSid)
    .update({ status: "closed" });
}

/**
 * Validate incoming Twilio webhook request
 */
export function validateTwilioWebhook(
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  if (!TWILIO_AUTH_TOKEN) {
    return false;
  }
  return Twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, url, params);
}

/**
 * Parse incoming SMS/message from Twilio webhook
 */
export interface IncomingMessage {
  from: string;
  to: string;
  body: string;
  messageSid: string;
  sessionSid?: string;
}

export function parseIncomingMessage(
  body: Record<string, string>,
): IncomingMessage {
  return {
    from: body.From,
    to: body.To,
    body: body.Body,
    messageSid: body.MessageSid,
    sessionSid: body.SessionSid,
  };
}

/**
 * Format a phone number to E.164 format for Twilio
 */
export function formatPhoneNumber(phone: string, countryCode = "1"): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If it already starts with country code, return with +
  if (digits.length === 11 && digits.startsWith(countryCode)) {
    return `+${digits}`;
  }

  // If it's 10 digits, add country code
  if (digits.length === 10) {
    return `+${countryCode}${digits}`;
  }

  // Return as-is with + prefix if already has country code
  if (digits.length > 10) {
    return `+${digits}`;
  }

  throw new Error(`Invalid phone number format: ${phone}`);
}

/**
 * Get suggested public meeting places based on location
 * These are common safe, public locations for exchanges
 */
export function getSuggestedMeetingPlaces(): string[] {
  return [
    "Local Mosque/Masjid",
    "Community Center",
    "Public Library",
    "Coffee Shop",
    "Shopping Mall Entrance",
    "Fire Station Parking Lot",
    "Police Station Lobby",
    "Hospital Main Entrance",
    "Bank Lobby",
    "Grocery Store Entrance",
    "Post Office",
    "City Hall",
    "Park Pavilion (Daytime)",
    "School Parking Lot (After Hours)",
    "Restaurant/Cafe",
  ];
}

/**
 * Safety tips for meetups
 */
export function getMeetupSafetyTips(): string[] {
  return [
    "Always meet in a well-lit, public place",
    "Bring a friend or family member if possible",
    "Let someone know where you're going and when",
    "Meet during daylight hours when possible",
    "Trust your instincts - if something feels wrong, leave",
    "Don't share your home address",
    "Keep your phone charged and accessible",
  ];
}
