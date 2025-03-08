
import { useState, useEffect } from "react";
import { Comment } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCommentReplies = (commentId: number, currentUserId?: string) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const { data: repliesData, error } = await supabase
          .from('Comments')
          .select('*, profiles:profiles(username)')
          .eq('parent_id', commentId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching replies:', error);
          return;
        }

        setReplies(repliesData || []);
      } catch (error) {
        console.error('Error in fetchReplies:', error);
      }
    };

    fetchReplies();

    // Set up realtime subscription for replies
    const subscription = supabase
      .channel(`comment-replies-${commentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Comments',
        filter: `parent_id=eq.${commentId}`
      }, (payload) => {
        // Add the new reply to the list
        const newReply = payload.new as Comment;
        setReplies(prev => [...prev, newReply]);
        
        // Auto-expand replies when a new one is added
        setIsExpanded(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [commentId]);

  const handleReply = async (applicationId: string) => {
    if (!currentUserId || !replyContent.trim()) return;

    try {
      const { data: newComment, error } = await supabase
        .from('Comments')
        .insert({
          comment: replyContent.trim(),
          application_id: applicationId,
          user_id: currentUserId,
          parent_id: commentId,
          upvotes: 0,
          downvotes: 0
        })
        .select('*, profiles:profiles(username)')
        .single();

      if (error) throw error;

      setReplyContent('');
      setIsReplying(false);
      setIsExpanded(true);
      
      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    isReplying,
    replyContent,
    replies,
    isExpanded,
    setIsReplying,
    setReplyContent,
    setIsExpanded,
    handleReply
  };
};
