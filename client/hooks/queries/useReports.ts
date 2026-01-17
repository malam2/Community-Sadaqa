import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReport } from "@/lib/api";
import { postKeys } from "./usePosts";

/**
 * Submit a report for a post
 */
export function useSubmitReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      postId,
      reason,
      details,
    }: {
      userId: string;
      postId: string;
      reason: string;
      details?: string;
    }) => submitReport(userId, postId, reason, details),
    onSuccess: (_data, variables) => {
      // Invalidate posts list in case the post gets hidden (3+ reports)
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      });
    },
  });
}
