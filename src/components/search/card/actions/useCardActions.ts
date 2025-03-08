
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/use-auth-state";
import { useVoteState } from "@/hooks/use-vote-state";
import { useSupportState } from "@/hooks/use-support-state";
import { useCommentsCount } from "@/hooks/use-comments-count";

export const useCardActions = (applicationId: number) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Use our extracted hooks
  const { user, showAuthDialog, setShowAuthDialog, checkAuth } = useAuthState();
  const { voteStatus, hotCount, notCount, isLoading: voteLoading } = useVoteState(applicationId, user);
  const { supportCount, isSupportedByUser } = useSupportState(applicationId, user);
  const commentsCount = useCommentsCount(applicationId);

  // Update loading state based on vote loading
  useEffect(() => {
    if (!voteLoading) {
      setIsLoading(false);
    }
  }, [voteLoading]);

  return {
    user,
    voteStatus,
    commentsCount,
    supportCount,
    hotCount,
    notCount,
    isSupportedByUser,
    showAuthDialog,
    setShowAuthDialog,
    isLoading,
    checkAuth
  };
};
