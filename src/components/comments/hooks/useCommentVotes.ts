
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCommentVotes = (commentId: number, currentUserId?: string, initialUpvotes = 0, initialDownvotes = 0) => {
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVoteStatus = async () => {
      if (!currentUserId) return;

      try {
        const { data, error } = await supabase
          .from('comment_votes')
          .select('vote_type')
          .eq('comment_id', commentId)
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching vote status:', error);
          return;
        }

        if (data) {
          setVoteStatus(data.vote_type as 'up' | 'down');
        }
      } catch (error) {
        console.error('Error in fetchVoteStatus:', error);
      }
    };

    fetchVoteStatus();
  }, [commentId, currentUserId]);

  const handleVoteChange = async (type: 'up' | 'down') => {
    if (!currentUserId) return;

    const isRemovingVote = type === voteStatus;
    const prevVoteStatus = voteStatus;
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;
    
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
        // Delete the vote
        const { error: deleteError } = await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUserId);

        if (deleteError) throw deleteError;
      } else {
        // Upsert the vote
        const { error: upsertError } = await supabase
          .from('comment_votes')
          .upsert({
            comment_id: commentId,
            user_id: currentUserId,
            vote_type: type
          }, {
            onConflict: 'comment_id,user_id'
          });

        if (upsertError) throw upsertError;
      }

      // Update comment vote counts
      const newUpvotes = type === 'up' && !isRemovingVote ? upvotes : prevVoteStatus === 'up' && (isRemovingVote || type === 'down') ? upvotes - 1 : upvotes;
      const newDownvotes = type === 'down' && !isRemovingVote ? downvotes : prevVoteStatus === 'down' && (isRemovingVote || type === 'up') ? downvotes - 1 : downvotes;
      
      const { error: updateError } = await supabase
        .from('Comments')
        .update({
          upvotes: newUpvotes,
          downvotes: newDownvotes
        })
        .eq('id', commentId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating vote:', error);
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive"
      });
      
      // Revert UI changes on error
      setVoteStatus(prevVoteStatus);
      setUpvotes(prevUpvotes);
      setDownvotes(prevDownvotes);
    }
  };

  return {
    voteStatus,
    upvotes,
    downvotes,
    handleVoteChange
  };
};
