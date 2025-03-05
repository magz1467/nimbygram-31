
import { Comment } from "@/types/planning";
import { format } from "date-fns";

export interface CommentHeaderProps {
  comment: Comment;
}

export const CommentHeader = ({ comment }: CommentHeaderProps) => {
  // Prioritize username from profiles, then user object, then email, finally fallback to Anonymous
  const displayName = comment.profiles?.username || 
                     comment.user?.username || 
                     comment.user_email?.split('@')[0] || 
                     'Anonymous';

  // Format the created_at date
  const formattedDate = comment.created_at 
    ? format(new Date(comment.created_at), 'dd MMM yyyy, h:mm a')
    : '';

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-primary">
          {displayName}
        </span>
        <span className="text-xs text-muted-foreground">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};
