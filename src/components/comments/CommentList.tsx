
import { useState, useEffect } from 'react';
import { Comment } from '@/types/planning';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useComments } from './hooks/useComments';

interface CommentListProps {
  applicationId: number;
  showExisting?: boolean;
}

export const CommentList = ({ applicationId, showExisting = true }: CommentListProps) => {
  const { comments = [], isLoading, currentUserId, setComments } = useComments(applicationId);

  useEffect(() => {
    console.log('CommentList rendered with:', {
      commentsCount: comments?.length || 0,
      applicationId,
      isLoading
    });
  }, [comments, applicationId, isLoading]);

  // Filter to only show top-level comments (those without a parent_id)
  const topLevelComments = comments.filter(comment => !comment.parent_id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CommentForm applicationId={applicationId} setComments={setComments} />
      {showExisting && topLevelComments.length > 0 ? (
        topLevelComments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment}
            currentUserId={currentUserId || ''}
          />
        ))
      ) : showExisting && (
        <p className="text-sm text-muted-foreground italic">No comments yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
};
