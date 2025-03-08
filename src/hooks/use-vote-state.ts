
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVoteState = (applicationId: number, user: any) => {
  const [voteStatus, setVoteStatus] = useState<'hot' | 'not' | null>(null);
  const [hotCount, setHotCount] = useState(0);
  const [notCount, setNotCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [tableExists, setTableExists] = useState(true);

  // Check if application_votes table exists
  useEffect(() => {
    const checkTableExists = async () => {
      try {
        const { error } = await supabase
          .from('application_votes')
          .select('count')
          .limit(1);
        
        if (error && error.code === '42P01') {
          // Table doesn't exist
          setTableExists(false);
          console.error('The application_votes table does not exist in the database', error);
          
          if (import.meta.env.MODE !== 'development') {
            toast({
              title: "Database setup required",
              description: "The voting system requires database setup. Please contact the administrator.",
              variant: "destructive",
              duration: 5000
            });
          }
        }
      } catch (error) {
        console.error('Error checking if table exists:', error);
      }
    };
    
    checkTableExists();
  }, [toast]);

  // Fetch user's vote status
  useEffect(() => {
    const getVoteStatus = async () => {
      if (!user || !tableExists) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('application_votes')
          .select('vote_type')
          .eq('application_id', applicationId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== '42P01') {
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
  }, [applicationId, user, tableExists]);

  // Fetch vote counts and set up realtime subscription
  useEffect(() => {
    if (!tableExists) {
      setIsLoading(false);
      return;
    }
    
    const getVoteCounts = async () => {
      try {
        const { data: hotData, error: hotError } = await supabase
          .from('application_votes')
          .select('*', { count: 'exact' })
          .eq('application_id', applicationId)
          .eq('vote_type', 'hot');
        
        if (hotError && hotError.code !== '42P01') {
          console.error('Error fetching hot votes:', hotError);
        }
        
        const { data: notData, error: notError } = await supabase
          .from('application_votes')
          .select('*', { count: 'exact' })
          .eq('application_id', applicationId)
          .eq('vote_type', 'not');

        if (notError && notError.code !== '42P01') {
          console.error('Error fetching not votes:', notError);
        }

        setHotCount(hotData?.length || 0);
        setNotCount(notData?.length || 0);
      } catch (error) {
        console.error('Error in getVoteCounts:', error);
      }
    };

    getVoteCounts();

    // Set up realtime subscription for votes if table exists
    let votesSubscription: any = null;
    
    if (tableExists) {
      votesSubscription = supabase
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
    }

    return () => {
      if (votesSubscription) {
        supabase.removeChannel(votesSubscription);
      }
    };
  }, [applicationId, user, tableExists]);

  return {
    voteStatus,
    hotCount,
    notCount,
    isLoading,
    tableExists
  };
};
