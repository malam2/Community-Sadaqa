import { getApiUrl } from "@/lib/query-client";
import { Post, PostType, PostCategory, ContactPreference } from "@/types/post";

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
}

export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(new URL("/api/posts", getApiUrl()).toString());
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const response = await fetch(
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
  const response = await fetch(new URL("/api/posts", getApiUrl()).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
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
  const response = await fetch(
    new URL(`/api/posts/${id}`, getApiUrl()).toString(),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update post");
  }
  return response.json();
}

export async function deletePost(id: string, userId: string): Promise<void> {
  const response = await fetch(
    new URL(`/api/posts/${id}`, getApiUrl()).toString(),
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
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
  const response = await fetch(
    new URL("/api/reports", getApiUrl()).toString(),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, postId, reason, details }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit report");
  }
}
