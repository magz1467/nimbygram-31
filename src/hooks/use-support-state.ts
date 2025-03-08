
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSupportState = (applicationId: number, user: any) => {
  const [supportCount, setSupportCount] = useState(0);
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Check if application_support table exists
  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('application_support')
        .select('count')
        .limit(1);
        
      if (error && error.code === '42P01') {
        console.error('The application_support table does not exist in the database', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking if table exists:', error);
      return false;
    }
  };
  
  // Fetch support count and set up realtime subscription
  useEffect(() => {
    const getSupportCount = async () => {
      setIsLoading(true);
      
      try {
        const tableExists = await checkTableExists();
        
        if (!tableExists) {
          setSupportCount(0);
          setIsLoading(false);
          return;
        }
        
        const { count, error } = await supabase
          .from('application_support')
          .select('*', { count: 'exact', head: true })
          .eq('application_id', applicationId);

        if (error) throw error;
        setSupportCount(count || 0);
      } catch (error) {
        console.error('Error fetching support count:', error);
        // Don't show the error toast here to avoid too many error notifications
      } finally {
        setIsLoading(false);
      }
    };

    getSupportCount();

    // Only set up subscription if we have application ID
    if (applicationId) {
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
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.log('Support subscription error, table might not exist yet');
          }
        });

      return () => {
        supabase.removeChannel(supportSubscription);
      };
    }
    
    return () => {};
  }, [applicationId]);

  // Fetch user's support status
  useEffect(() => {
    const getSupportStatus = async () => {
      if (!user) {
        setIsSupportedByUser(false);
        return;
      }
      
      try {
        const tableExists = await checkTableExists();
        
        if (!tableExists) {
          setIsSupportedByUser(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('application_support')
          .select('id')
          .eq('application_id', applicationId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setIsSupportedByUser(!!data);
      } catch (error) {
        console.error('Error fetching user support status:', error);
        setIsSupportedByUser(false);
      }
    };

    getSupportStatus();
  }, [applicationId, user]);

  return {
    supportCount,
    isSupportedByUser,
    isLoading
  };
};
