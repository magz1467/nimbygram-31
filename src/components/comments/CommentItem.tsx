
import { Comment } from "@/types/planning";
import { Card } from "@/components/ui/card";
import { CommentHeader } from "./CommentHeader";
import { CommentContent } from "./CommentContent";
import { CommentVoteSection } from "./CommentVoteSection";
import { CommentActions } from "./CommentActions";
import { CommentReplyForm } from "./CommentReplyForm";
import { CommentReplies } from "./CommentReplies";
import { useCommentItem } from "./hooks/useCommentItem";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  level?: number;
  onReplyAdded?: (newComment: Comment) => void;
}

export const CommentItem = ({ 
  comment, 
  currentUserId,
  level = 0,
  onReplyAdded 
}: CommentItemProps) => {
  const {
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
    handleReply
  } = useCommentItem(comment, currentUserId);

  return (
    <div className={`${level > 0 ? 'ml-6' : ''}`}>
      <Card className="p-4">
        <CommentHeader comment={comment} />
        <CommentContent comment={comment} />
        <div className="mt-2 flex items-center space-x-4">
          <CommentVoteSection
            commentId={comment.id}
            upvotes={upvotes}
            downvotes={downvotes}
            currentUserId={currentUserId}
            voteStatus={voteStatus}
            onVoteChange={handleVoteChange}
          />
          <CommentActions
            currentUserId={currentUserId}
            level={level}
            repliesCount={replies.length}
            isExpanded={isExpanded}
            onReplyClick={() => setIsReplying(!isReplying)}
            onExpandClick={() => setIsExpanded(!isExpanded)}
          />
        </div>

        {isReplying && (
          <CommentReplyForm
            replyContent={replyContent}
            onReplyChange={setReplyContent}
            onReplySubmit={handleReply}
            onReplyCancel={() => setIsReplying(false)}
          />
        )}
      </Card>

      <CommentReplies
        replies={replies}
        currentUserId={currentUserId}
        level={level + 1}
        isExpanded={isExpanded}
        onReplyAdded={onReplyAdded}
      />
    </div>
  );
};
