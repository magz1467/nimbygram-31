
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCommentsCount = (applicationId: number) => {
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    const getCommentsCount = async () => {
      const { count } = await supabase
        .from('Comments')
        .select('*', { count: 'exact', head: true })
        .eq('application_id', applicationId);

      setCommentsCount(count || 0);
    };

    getCommentsCount();

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

    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [applicationId]);

  return commentsCount;
};
