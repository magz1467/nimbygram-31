
import { useVoteButtons } from "@/hooks/use-vote-buttons";
import { VoteButton } from "./VoteButton";

interface VoteButtonsProps {
  applicationId: number;
  voteStatus: 'hot' | 'not' | null;
  hotCount: number;
  notCount: number;
  checkAuth: (callback: () => void) => boolean;
}

export const VoteButtons = ({ 
  applicationId, 
  voteStatus, 
  hotCount, 
  notCount, 
  checkAuth 
}: VoteButtonsProps) => {
  const {
    localVoteStatus,
    localHotCount,
    localNotCount,
    isSubmitting,
    handleVote
  } = useVoteButtons({
    applicationId,
    voteStatus,
    hotCount,
    notCount
  });

  return (
    <div className="grid grid-cols-2 gap-2">
      <VoteButton 
        type="hot"
        count={localHotCount}
        isActive={localVoteStatus === 'hot'}
        isDisabled={isSubmitting}
        onClick={() => checkAuth(() => handleVote('hot', checkAuth))}
      />
      
      <VoteButton 
        type="not"
        count={localNotCount}
        isActive={localVoteStatus === 'not'}
        isDisabled={isSubmitting}
        onClick={() => checkAuth(() => handleVote('not', checkAuth))}
      />
    </div>
  );
};
