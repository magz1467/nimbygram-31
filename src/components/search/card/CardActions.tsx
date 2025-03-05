
import { useCardActions } from "./actions/useCardActions";
import { VoteButtons } from "./actions/VoteButtons";
import { SupportButton } from "./actions/SupportButton";
import { CommentButton } from "./actions/CommentButton";
import { ShareButton } from "./actions/ShareButton";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface CardActionsProps {
  applicationId: number;
  onShowComments: () => void;
  onShare: () => void;
}

export const CardActions = ({ applicationId, onShowComments, onShare }: CardActionsProps) => {
  const {
    user,
    voteStatus,
    commentsCount,
    supportCount,
    isSupportedByUser,
    showAuthDialog,
    setShowAuthDialog,
    isLoading,
    checkAuth
  } = useCardActions(applicationId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <VoteButtons 
          applicationId={applicationId}
          voteStatus={voteStatus}
          checkAuth={checkAuth}
        />
        <SupportButton
          applicationId={applicationId}
          supportCount={supportCount}
          isSupportedByUser={isSupportedByUser}
          checkAuth={checkAuth}
        />
      </div>

      <div className="flex flex-col gap-2">
        <CommentButton
          applicationId={applicationId}
          commentsCount={commentsCount}
          onShowComments={onShowComments}
          user={user}
          checkAuth={checkAuth}
        />

        <ShareButton onShare={onShare} />
      </div>

      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </div>
  );
};
