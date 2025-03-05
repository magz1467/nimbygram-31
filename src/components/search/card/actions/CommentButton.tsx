
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InlineCommentForm } from "./InlineCommentForm";

interface CommentButtonProps {
  applicationId: number;
  commentsCount: number;
  onShowComments: () => void;
  user: any | null;
  checkAuth: (callback: () => void) => boolean;
}

export const CommentButton = ({ 
  applicationId, 
  commentsCount, 
  onShowComments,
  user,
  checkAuth
}: CommentButtonProps) => {
  const [showInlineCommentForm, setShowInlineCommentForm] = useState(false);

  const getCommentButtonText = () => {
    if (commentsCount === 0) {
      return 'Be the first to have your say';
    }
    return `Show comments${commentsCount > 0 ? ` (${commentsCount})` : ''}`;
  };

  const handleCommentsClick = () => {
    if (commentsCount === 0) {
      // If there are no comments, check if user is authenticated
      if (!checkAuth(() => {})) return;
      
      // Show inline comment form for first comment
      setShowInlineCommentForm(!showInlineCommentForm);
    } else {
      // Otherwise toggle comment visibility
      onShowComments();
    }
  };

  const onCommentSubmitted = () => {
    setShowInlineCommentForm(false);
    onShowComments();
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="justify-start h-8 w-full"
        onClick={handleCommentsClick}
      >
        <div className="relative flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          {commentsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {commentsCount}
            </span>
          )}
          <span>{getCommentButtonText()}</span>
        </div>
      </Button>

      {showInlineCommentForm && user && (
        <InlineCommentForm 
          applicationId={applicationId} 
          onCancel={() => setShowInlineCommentForm(false)}
          onSubmitted={onCommentSubmitted}
          user={user}
        />
      )}
    </div>
  );
};
