
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types/planning";

interface CommentFormProps {
  applicationId: number;
  setComments: (comments: Comment[]) => void;
}

export const CommentForm = ({ applicationId, setComments }: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to comment",
          variant: "destructive",
        });
        return;
      }

      const { data: newComment, error } = await supabase
        .from('Comments')
        .insert({
          comment: content.trim(),
          application_id: applicationId,
          user_id: session.user.id,
          user_email: session.user.email,
          upvotes: 0,
          downvotes: 0,
          parent_id: null // Explicitly set to null for top-level comments
        })
        .select('*, profiles:profiles(username)')
        .single();

      if (error) throw error;

      // Get updated comments
      const { data: currentComments } = await supabase
        .from('Comments')
        .select('*, profiles:profiles(username)')
        .eq('application_id', applicationId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      setComments(currentComments as Comment[]);
      setContent("");
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="min-h-[100px]"
      />
      <Button 
        type="submit" 
        disabled={isSubmitting || !content.trim()}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
};
