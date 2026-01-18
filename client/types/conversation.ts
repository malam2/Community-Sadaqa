/**
 * Conversation & Messaging Types
 */

export type ConversationStatus =
  | "active"
  | "meeting_set"
  | "completed"
  | "cancelled";

export interface Conversation {
  id: string;
  postId: string;
  participant1Id: string;
  participant2Id: string;
  twilioSessionSid?: string;
  meetingLocation?: string;
  meetingAddress?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  meetingTime?: number;
  meetingNotes?: string;
  status: ConversationStatus;
  createdAt: number;
  updatedAt: number;
  // Enriched fields from API
  postTitle?: string;
  postType?: "request" | "offer";
  otherParticipantName?: string;
  lastMessage?: {
    content: string;
    createdAt: number;
    isFromMe: boolean;
  };
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  twilioMessageSid?: string;
  isRead: boolean;
  createdAt: number;
  // Enriched fields from API
  senderName?: string;
  isFromMe?: boolean;
}

export interface MeetingDetails {
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  time?: number;
  notes?: string;
}

export interface MeetingInfo {
  suggestedPlaces: string[];
  safetyTips: string[];
  twilioEnabled: boolean;
}

/**
 * Helper to format conversation status for display
 */
export function getConversationStatusLabel(status: ConversationStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "meeting_set":
      return "Meeting Scheduled";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

/**
 * Helper to get status color
 */
export function getConversationStatusColor(
  status: ConversationStatus,
): string {
  switch (status) {
    case "active":
      return "#2D8659"; // primary green
    case "meeting_set":
      return "#1976D2"; // blue
    case "completed":
      return "#666666"; // gray
    case "cancelled":
      return "#D84315"; // orange/red
    default:
      return "#666666";
  }
}
