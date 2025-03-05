
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCardActions = (applicationId: number) => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [voteStatus, setVoteStatus] = useState<'hot' | 'not' | null>(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      // Clean up the listener when component unmounts
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    
    // Fetch user's vote status
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
    };

    // Fetch user's support status
    const getSupportStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('application_support')
        .select('id')
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsSupportedByUser(!!data);
      setIsLoading(false);
    };

    getVoteStatus();
    getSupportStatus();
  }, [applicationId, user]);

  useEffect(() => {
    // Fetch comments count
    const getCommentsCount = async () => {
      const { count } = await supabase
        .from('Comments')
        .select('*', { count: 'exact', head: true })
        .eq('application_id', applicationId);

      setCommentsCount(count || 0);
    };

    // Fetch support count
    const getSupportCount = async () => {
      const { count } = await supabase
        .from('application_support')
        .select('*', { count: 'exact', head: true })
        .eq('application_id', applicationId);

      setSupportCount(count || 0);
    };

    getCommentsCount();
    getSupportCount();

    // Set up realtime subscriptions
    const commentsSubscription = supabase
      .channel('Comments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Comments',
        filter: `application_id=eq.${applicationId}`
      }, () => {
        getCommentsCount();
      })
      .subscribe();

    const supportSubscription = supabase
      .channel('support-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'application_support',
        filter: `application_id=eq.${applicationId}`
      }, () => {
        getSupportCount();
      })
      .subscribe();

    // Set up realtime subscription for votes
    const votesSubscription = supabase
      .channel('votes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'application_votes',
        filter: user ? `application_id=eq.${applicationId} AND user_id=eq.${user.id}` : `application_id=eq.${applicationId}`
      }, (payload) => {
        // Fix for TS2339 error: check if payload.new exists and has user_id and vote_type properties
        if (user && payload.new && 'user_id' in payload.new && 'vote_type' in payload.new) {
          if (payload.new.user_id === user.id) {
            setVoteStatus(payload.new.vote_type as 'hot' | 'not' | null);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(supportSubscription);
      supabase.removeChannel(votesSubscription);
    };
  }, [applicationId, user]);

  const checkAuth = (callback: () => void) => {
    if (!user) {
      setShowAuthDialog(true);
      return false;
    }
    callback();
    return true;
  };

  return {
    user,
    voteStatus,
    commentsCount,
    supportCount,
    isSupportedByUser,
    showAuthDialog,
    setShowAuthDialog,
    isLoading,
    checkAuth
  };
};
