
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseVoteButtonsProps {
  applicationId: number;
  voteStatus: 'hot' | 'not' | null;
  hotCount: number;
  notCount: number;
}

export const useVoteButtons = ({ 
  applicationId, 
  voteStatus: initialVoteStatus, 
  hotCount: initialHotCount,
  notCount: initialNotCount
}: UseVoteButtonsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localVoteStatus, setLocalVoteStatus] = useState<'hot' | 'not' | null>(initialVoteStatus);
  const [localHotCount, setLocalHotCount] = useState(initialHotCount);
  const [localNotCount, setLocalNotCount] = useState(initialNotCount);
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    setLocalVoteStatus(initialVoteStatus);
    setLocalHotCount(initialHotCount);
    setLocalNotCount(initialNotCount);
  }, [initialVoteStatus, initialHotCount, initialNotCount]);

  const handleVote = async (type: 'hot' | 'not', checkAuth: (callback: () => void) => boolean) => {
    if (!checkAuth(() => {})) return;
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Store previous state to allow reversion if needed
      const previousVoteStatus = localVoteStatus;
      const previousHotCount = localHotCount;
      const previousNotCount = localNotCount;
      const isRemovingVote = localVoteStatus === type;
      
      // Update local state immediately for responsive UI
      if (isRemovingVote) {
        setLocalVoteStatus(null);
        if (type === 'hot') setLocalHotCount(prev => Math.max(0, prev - 1));
        if (type === 'not') setLocalNotCount(prev => Math.max(0, prev - 1));
      } else {
        // Switching vote or adding new vote
        if (localVoteStatus === 'hot' && type === 'not') {
          setLocalHotCount(prev => Math.max(0, prev - 1));
          setLocalNotCount(prev => prev + 1);
        } else if (localVoteStatus === 'not' && type === 'hot') {
          setLocalNotCount(prev => Math.max(0, prev - 1));
          setLocalHotCount(prev => prev + 1);
        } else if (localVoteStatus === null) {
          // New vote
          if (type === 'hot') setLocalHotCount(prev => prev + 1);
          if (type === 'not') setLocalNotCount(prev => prev + 1);
        }
        setLocalVoteStatus(type);
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        // Revert changes if user is not authenticated
        setLocalVoteStatus(previousVoteStatus);
        setLocalHotCount(previousHotCount);
        setLocalNotCount(previousNotCount);
        return;
      }

      if (isRemovingVote) {
        // Removing vote
        const { error } = await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', applicationId)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error removing vote:', error);
          throw error;
        }
        
        toast({
          title: "Vote removed",
          description: "Your vote has been removed"
        });
      } else {
        // Adding or changing vote
        const { error } = await supabase
          .from('comment_votes')
          .upsert({
            comment_id: applicationId,
            user_id: user.id,
            vote_type: type
          }, {
            onConflict: 'comment_id,user_id'
          });
          
        if (error) {
          console.error('Error saving vote:', error);
          throw error;
        }
        
        toast({
          title: "Vote recorded",
          description: `You voted this application as ${type === 'hot' ? 'hot' : 'not'}`
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Revert to server state on error
      setLocalVoteStatus(initialVoteStatus);
      setLocalHotCount(initialHotCount);
      setLocalNotCount(initialNotCount);
      
      toast({
        title: "Error",
        description: "Failed to save your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    localVoteStatus,
    localHotCount,
    localNotCount,
    isSubmitting,
    handleVote
  };
};
