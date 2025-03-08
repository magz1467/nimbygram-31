
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
    comment.id,
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
  } = useCommentReplies(comment.id, currentUserId);

  const handleSubmitReply = () => {
    handleReply(comment.application_id);
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
