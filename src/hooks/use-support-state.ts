
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSupportState = (applicationId: number, user: any) => {
  const [supportCount, setSupportCount] = useState(0);
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);
  
  // Fetch support count and set up realtime subscription
  useEffect(() => {
    const getSupportCount = async () => {
      const { count } = await supabase
        .from('application_support')
        .select('*', { count: 'exact', head: true })
        .eq('application_id', applicationId);

      setSupportCount(count || 0);
    };

    getSupportCount();

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

    return () => {
      supabase.removeChannel(supportSubscription);
    };
  }, [applicationId]);

  // Fetch user's support status
  useEffect(() => {
    const getSupportStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('application_support')
        .select('id')
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsSupportedByUser(!!data);
    };

    getSupportStatus();
  }, [applicationId, user]);

  return {
    supportCount,
    isSupportedByUser
  };
};
