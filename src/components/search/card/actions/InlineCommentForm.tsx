
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InlineCommentFormProps {
  applicationId: number;
  onCancel: () => void;
  onSubmitted: () => void;
  user: any;
}

export const InlineCommentForm = ({ 
  applicationId, 
  onCancel, 
  onSubmitted,
  user
}: InlineCommentFormProps) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitComment = async () => {
    if (!commentText.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const { data: newComment, error } = await supabase
        .from('Comments')
        .insert({
          comment: commentText.trim(),
          application_id: applicationId,
          user_id: user.id,
          user_email: user.email,
          upvotes: 0,
          downvotes: 0
        })
        .select('*')
        .single();

      if (error) throw error;

      setCommentText('');
      onSubmitted();
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <Textarea
        placeholder="Write your comment here..."
        className="min-h-[80px] text-sm"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={submitComment}
          disabled={!commentText.trim() || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  );
};
