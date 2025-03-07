
import { useState, useEffect } from "react";
import { Comment } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCommentItem = (comment: Comment, currentUserId?: string) => {
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [upvotes, setUpvotes] = useState(comment.upvotes || 0);
  const [downvotes, setDownvotes] = useState(comment.downvotes || 0);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVoteStatus = async () => {
      if (!currentUserId) return;

      const { data } = await supabase
        .from('comment_votes')
        .select('vote_type')
        .eq('comment_id', comment.id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (data) {
        setVoteStatus(data.vote_type as 'up' | 'down');
      }
    };

    const fetchReplies = async () => {
      const { data: repliesData, error } = await supabase
        .from('Comments')
        .select('*, profiles:profiles(username)')
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return;
      }

      setReplies(repliesData || []);
    };

    fetchVoteStatus();
    fetchReplies();

    // Set up realtime subscription for replies
    const subscription = supabase
      .channel(`comment-replies-${comment.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Comments',
        filter: `parent_id=eq.${comment.id}`
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
  }, [comment.id, currentUserId]);

  const handleVoteChange = async (type: 'up' | 'down') => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on comments",
        variant: "destructive"
      });
      return;
    }

    const isRemovingVote = type === voteStatus;
    
    // Optimistically update UI
    if (isRemovingVote) {
      if (type === 'up') setUpvotes(prev => prev - 1);
      if (type === 'down') setDownvotes(prev => prev - 1);
      setVoteStatus(null);
    } else {
      if (voteStatus === 'up') setUpvotes(prev => prev - 1);
      if (voteStatus === 'down') setDownvotes(prev => prev - 1);
      
      if (type === 'up') setUpvotes(prev => prev + 1);
      if (type === 'down') setDownvotes(prev => prev + 1);
      setVoteStatus(type);
    }

    try {
      if (isRemovingVote) {
        const { error } = await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', currentUserId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comment_votes')
          .upsert({
            comment_id: comment.id,
            user_id: currentUserId,
            vote_type: type
          }, {
            onConflict: 'comment_id,user_id'
          });
          
        if (error) throw error;
      }

      const { error: updateError } = await supabase
        .from('Comments')
        .update({
          upvotes: type === 'up' ? upvotes : (voteStatus === 'up' ? upvotes - 1 : upvotes),
          downvotes: type === 'down' ? downvotes : (voteStatus === 'down' ? downvotes - 1 : downvotes)
        })
        .eq('id', comment.id);
        
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating vote:', error);
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive"
      });
      
      // Revert UI changes on error
      setVoteStatus(voteStatus);
      setUpvotes(comment.upvotes || 0);
      setDownvotes(comment.downvotes || 0);
    }
  };

  const handleReply = async () => {
    if (!currentUserId || !replyContent.trim()) return;

    try {
      const { data: newComment, error } = await supabase
        .from('Comments')
        .insert({
          comment: replyContent.trim(),
          application_id: comment.application_id,
          user_id: currentUserId,
          parent_id: comment.id,
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
    voteStatus,
    upvotes,
    downvotes,
    isReplying,
    replyContent,
    replies,
    isExpanded,
    setIsReplying,
    setReplyContent,
    setIsExpanded,
    handleVoteChange,
    handleReply
  };
};
