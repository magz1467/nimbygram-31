
import { CommentVotes } from "./CommentVotes";

interface CommentVoteSectionProps {
  commentId: number;
  upvotes: number;
  downvotes: number;
  currentUserId?: string;
  voteStatus: 'up' | 'down' | null;
  onVoteChange: (type: 'up' | 'down') => Promise<void>;
}

export const CommentVoteSection = ({
  commentId,
  upvotes,
  downvotes,
  currentUserId,
  voteStatus,
  onVoteChange
}: CommentVoteSectionProps) => {
  return (
    <CommentVotes
      commentId={commentId}
      upvotes={upvotes}
      downvotes={downvotes}
      currentUserId={currentUserId}
      voteStatus={voteStatus}
      onVoteChange={onVoteChange}
    />
  );
};
