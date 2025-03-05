
import { useState } from "react";
import { useCardActions } from "./actions/useCardActions";
import { VoteButtons } from "./actions/VoteButtons";
import { SupportButton } from "./actions/SupportButton";
import { CommentButton } from "./actions/CommentButton";
import { ShareButton } from "./actions/ShareButton";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";

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
    checkAuth
  } = useCardActions(applicationId);

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
