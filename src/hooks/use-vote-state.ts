
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVoteState = (applicationId: number, user: any) => {
  const [voteStatus, setVoteStatus] = useState<'hot' | 'not' | null>(null);
  const [hotCount, setHotCount] = useState(0);
  const [notCount, setNotCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's vote status
  useEffect(() => {
    const getVoteStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('comment_votes')
          .select('vote_type')
          .eq('comment_id', applicationId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching vote status:', error);
        }
        
        setVoteStatus(data?.vote_type || null);
      } catch (error) {
        console.error('Error in getVoteStatus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getVoteStatus();
  }, [applicationId, user]);

  // Fetch vote counts and set up realtime subscription
  useEffect(() => {
    const getVoteCounts = async () => {
      try {
        const { data: hotData, error: hotError } = await supabase
          .from('comment_votes')
          .select('*', { count: 'exact' })
          .eq('comment_id', applicationId)
          .eq('vote_type', 'hot');
        
        if (hotError) {
          console.error('Error fetching hot votes:', hotError);
        }
        
        const { data: notData, error: notError } = await supabase
          .from('comment_votes')
          .select('*', { count: 'exact' })
          .eq('comment_id', applicationId)
          .eq('vote_type', 'not');

        if (notError) {
          console.error('Error fetching not votes:', notError);
        }

        setHotCount(hotData?.length || 0);
        setNotCount(notData?.length || 0);
      } catch (error) {
        console.error('Error in getVoteCounts:', error);
      }
    };

    getVoteCounts();

    // Set up realtime subscription for votes
    const votesSubscription = supabase
      .channel('votes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comment_votes',
        filter: `comment_id=eq.${applicationId}`
      }, () => {
        getVoteCounts();
        if (user) {
          // Also check if the user's vote status changed
          const getUserVoteStatus = async () => {
            const { data } = await supabase
              .from('comment_votes')
              .select('vote_type')
              .eq('comment_id', applicationId)
              .eq('user_id', user.id)
              .maybeSingle();
            
            setVoteStatus(data?.vote_type as 'hot' | 'not' | null);
          };
          
          getUserVoteStatus();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(votesSubscription);
    };
  }, [applicationId, user]);

  return {
    voteStatus,
    hotCount,
    notCount,
    isLoading,
    tableExists: true
  };
};
