import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Post } from "@/types/post";
import {
  fetchPosts,
  fetchUserPosts,
  createPost,
  updatePost,
  deletePost,
  CreatePostData,
} from "@/lib/api";

// Query Keys
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters?: { type?: string; category?: string; search?: string }) =>
    [...postKeys.lists(), filters] as const,
  userPosts: (userId: string) => [...postKeys.all, "user", userId] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
};

/**
 * Fetch all posts with optional client-side filtering
 */
export function usePostsQuery(filters?: {
  type?: "request" | "offer" | "all";
  category?: string;
  urgent?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: fetchPosts,
    select: (posts) => {
      let filtered = posts;

      // Filter by type
      if (filters?.type && filters.type !== "all") {
        filtered = filtered.filter((p) => p.type === filters.type);
      }

      // Filter by category
      if (filters?.category && filters.category !== "all") {
        filtered = filtered.filter((p) => p.category === filters.category);
      }

      // Filter by urgent
      if (filters?.urgent) {
        filtered = filtered.filter((p) => p.urgent);
      }

      // Filter by search term
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower),
        );
      }

      return filtered;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch posts by a specific user
 */
export function useUserPostsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: postKeys.userPosts(userId ?? ""),
    queryFn: () => fetchUserPosts(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Get a single post from cache or fetch
 */
export function usePostQuery(postId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: async () => {
      // Try to get from cache first
      const allPosts = queryClient.getQueryData<Post[]>(postKeys.lists());
      const cached = allPosts?.find((p) => p.id === postId);
      if (cached) return cached;

      // Fetch all posts and find the one we need
      const posts = await fetchPosts();
      return posts.find((p) => p.id === postId) ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create a new post
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreatePostData }) =>
      createPost(userId, data),
    onSuccess: (newPost) => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });

      // Also invalidate user posts if we know the author
      if (newPost.authorId) {
        queryClient.invalidateQueries({
          queryKey: postKeys.userPosts(newPost.authorId),
        });
      }
    },
  });
}

/**
 * Update a post (mark as fulfilled, edit, etc.)
 */
export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userId,
      updates,
    }: {
      id: string;
      userId: string;
      updates: Partial<Post>;
    }) => updatePost(id, userId, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData<Post[]>(postKeys.lists());

      // Optimistically update the cache
      if (previousPosts) {
        queryClient.setQueryData<Post[]>(
          postKeys.lists(),
          previousPosts.map((post) =>
            post.id === id ? { ...post, ...updates } : post,
          ),
        );
      }

      return { previousPosts };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Delete a post
 */
export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deletePost(id, userId),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData<Post[]>(postKeys.lists());

      // Optimistically remove from cache
      if (previousPosts) {
        queryClient.setQueryData<Post[]>(
          postKeys.lists(),
          previousPosts.filter((post) => post.id !== id),
        );
      }

      return { previousPosts };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
