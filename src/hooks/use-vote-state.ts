
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
      
      const { data } = await supabase
        .from('application_votes')
        .select('vote_type')
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .maybeSingle();

      setVoteStatus(data?.vote_type || null);
      setIsLoading(false);
    };

    getVoteStatus();
  }, [applicationId, user]);

  // Fetch vote counts and set up realtime subscription
  useEffect(() => {
    const getVoteCounts = async () => {
      const { data: hotData } = await supabase
        .from('application_votes')
        .select('*', { count: 'exact' })
        .eq('application_id', applicationId)
        .eq('vote_type', 'hot');
      
      const { data: notData } = await supabase
        .from('application_votes')
        .select('*', { count: 'exact' })
        .eq('application_id', applicationId)
        .eq('vote_type', 'not');

      setHotCount(hotData?.length || 0);
      setNotCount(notData?.length || 0);
    };

    getVoteCounts();

    // Set up realtime subscription for votes
    const votesSubscription = supabase
      .channel('votes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'application_votes',
        filter: `application_id=eq.${applicationId}`
      }, () => {
        getVoteCounts();
        if (user) {
          // Also check if the user's vote status changed
          const getUserVoteStatus = async () => {
            const { data } = await supabase
              .from('application_votes')
              .select('vote_type')
              .eq('application_id', applicationId)
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
    isLoading
  };
};
