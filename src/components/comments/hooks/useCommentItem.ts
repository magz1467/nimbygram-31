
import { Comment } from "@/types/planning";
import { useCommentVotes } from "./useCommentVotes";
import { useCommentReplies } from "./useCommentReplies";

export const useCommentItem = (comment: Comment, currentUserId?: string) => {
  const {
    voteStatus,
    upvotes,
    downvotes,
    handleVoteChange
  } = useCommentVotes(
    Number(comment.id), // Ensure we pass a number type
    currentUserId,
    comment.upvotes || 0,
    comment.downvotes || 0
  );

  const {
    isReplying,
    replyContent,
    replies,
    isExpanded,
    setIsReplying,
    setReplyContent,
    setIsExpanded,
    handleReply
  } = useCommentReplies(Number(comment.id), currentUserId);

  const handleSubmitReply = () => {
    // Convert application_id to string if handleReply expects a string
    handleReply(String(comment.application_id));
  };

  return {
    voteStatus,
    upvotes,
    downvotes,
    isReplying,
    replyContent,
    replies,
    isExpanded,
    setIsReplying,
    setReplyContent,
    setIsExpanded,
    handleVoteChange,
    handleReply: handleSubmitReply
  };
};
