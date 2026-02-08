import { getApiUrl } from "@/lib/query-client";
import { authFetch } from "@/lib/auth";
import { Post, PostType, PostCategory, ContactPreference, ExchangeType } from "@/types/post";
import { Conversation, Message, MeetingInfo, MeetingDetails } from "@/types/conversation";
import { UserLocation } from "@/types/location";

export interface CreatePostData {
  type: PostType;
  category: PostCategory;
  title: string;
  description: string;
  isAnonymous: boolean;
  urgent: boolean;
  contactPreference: ContactPreference;
  contactPhone?: string;
  contactEmail?: string;
  // Location fields
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  // Exchange type
  exchangeType?: ExchangeType;
  exchangeNotes?: string;
}

export interface FetchPostsOptions {
  lat?: number;
  lng?: number;
  radius?: number;
}

export async function fetchPosts(options?: FetchPostsOptions): Promise<Post[]> {
  const url = new URL("/api/posts", getApiUrl());
  
  if (options?.lat !== undefined) {
    url.searchParams.set("lat", options.lat.toString());
  }
  if (options?.lng !== undefined) {
    url.searchParams.set("lng", options.lng.toString());
  }
  if (options?.radius !== undefined) {
    url.searchParams.set("radius", options.radius.toString());
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const response = await authFetch(
    new URL(`/api/posts/user/${userId}`, getApiUrl()).toString(),
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user posts");
  }
  return response.json();
}

export async function createPost(
  userId: string,
  data: CreatePostData,
): Promise<Post> {
  const response = await authFetch(new URL("/api/posts", getApiUrl()).toString(), {
    method: "POST",
    body: JSON.stringify({
      communityId: "local_ummah",
      ...data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create post");
  }
  return response.json();
}

export async function updatePost(
  id: string,
  userId: string,
  updates: Partial<Post>,
): Promise<Post> {
  const response = await authFetch(
    new URL(`/api/posts/${id}`, getApiUrl()).toString(),
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update post");
  }
  return response.json();
}

export async function deletePost(id: string, userId: string): Promise<void> {
  const response = await authFetch(
    new URL(`/api/posts/${id}`, getApiUrl()).toString(),
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete post");
  }
}

export async function submitReport(
  userId: string,
  postId: string,
  reason: string,
  details?: string,
): Promise<void> {
  const response = await authFetch(
    new URL("/api/reports", getApiUrl()).toString(),
    {
      method: "POST",
      body: JSON.stringify({ postId, reason, details }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit report");
  }
}

// ============================================
// User Location API
// ============================================

export async function updateUserLocation(
  userId: string,
  location: UserLocation,
): Promise<void> {
  const response = await authFetch(
    new URL(`/api/users/${userId}`, getApiUrl()).toString(),
    {
      method: "PATCH",
      body: JSON.stringify(location),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update location");
  }
}

// ============================================
// Conversation & Messaging API
// ============================================

export async function fetchMeetingInfo(): Promise<MeetingInfo> {
  const response = await fetch(
    new URL("/api/meeting-info", getApiUrl()).toString(),
  );
  if (!response.ok) {
    throw new Error("Failed to fetch meeting info");
  }
  return response.json();
}

export async function startConversation(
  userId: string,
  postId: string,
): Promise<Conversation> {
  const response = await authFetch(
    new URL("/api/conversations", getApiUrl()).toString(),
    {
      method: "POST",
      body: JSON.stringify({ postId }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to start conversation");
  }
  return response.json();
}

export async function fetchUserConversations(
  userId: string,
): Promise<Conversation[]> {
  const response = await authFetch(
    new URL(`/api/conversations/user/${userId}`, getApiUrl()).toString(),
  );
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
}

export async function fetchConversationMessages(
  conversationId: string,
  userId: string,
): Promise<Message[]> {
  const response = await authFetch(
    new URL(
      `/api/conversations/${conversationId}/messages`,
      getApiUrl(),
    ).toString(),
  );
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}

export async function sendMessage(
  conversationId: string,
  userId: string,
  content: string,
): Promise<Message> {
  const response = await authFetch(
    new URL(
      `/api/conversations/${conversationId}/messages`,
      getApiUrl(),
    ).toString(),
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send message");
  }
  return response.json();
}

export async function setMeetingDetails(
  conversationId: string,
  userId: string,
  meeting: MeetingDetails,
): Promise<Conversation> {
  const response = await authFetch(
    new URL(
      `/api/conversations/${conversationId}/meeting`,
      getApiUrl(),
    ).toString(),
    {
      method: "PATCH",
      body: JSON.stringify({
        meetingLocation: meeting.location,
        meetingAddress: meeting.address,
        meetingLatitude: meeting.latitude,
        meetingLongitude: meeting.longitude,
        meetingTime: meeting.time ? new Date(meeting.time).toISOString() : undefined,
        meetingNotes: meeting.notes,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to set meeting details");
  }
  return response.json();
}

export async function completeConversation(
  conversationId: string,
  userId: string,
): Promise<Conversation> {
  const response = await authFetch(
    new URL(
      `/api/conversations/${conversationId}/complete`,
      getApiUrl(),
    ).toString(),
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to complete conversation");
  }
  return response.json();
}
