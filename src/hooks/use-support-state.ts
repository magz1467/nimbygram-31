
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSupportState = (applicationId: number, user: any) => {
  const [supportCount, setSupportCount] = useState(0);
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableExists, setTableExists] = useState(false);
  const { toast } = useToast();
  
  // Check if application_support table exists
  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('saved_applications') // Use a table we know exists to verify connection
        .select('count')
        .limit(1);
        
      if (error) {
        console.error('Error checking database connection:', error);
        return false;
      }
      
      // Now try to check the application_support table
      const { error: supportTableError } = await supabase
        .rpc('check_table_exists', { table_name: 'application_support' });
      
      if (supportTableError) {
        console.log('Application support table does not exist yet');
        setTableExists(false);
        return false;
      }
      
      setTableExists(true);
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
        const exists = await checkTableExists();
        
        if (!exists) {
          setSupportCount(0);
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('application_support')
          .select('id', { count: 'exact' })
          .eq('application_id', applicationId);

        if (error) {
          // If error is because table doesn't exist, don't show error
          if (error.code === '42P01') {
            console.log('Support table not created yet - no support data available');
            setTableExists(false);
          } else {
            console.error('Error fetching support count:', error);
          }
          setSupportCount(0);
        } else {
          setSupportCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching support count:', error);
        setSupportCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    getSupportCount();

    // Only set up subscription if we have application ID and the table exists
    if (applicationId && tableExists) {
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
            setTableExists(false);
          }
        });

      return () => {
        supabase.removeChannel(supportSubscription);
      };
    }
    
    return () => {};
  }, [applicationId, tableExists]);

  // Fetch user's support status
  useEffect(() => {
    const getSupportStatus = async () => {
      if (!user || !tableExists) {
        setIsSupportedByUser(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('application_support')
          .select('id')
          .eq('application_id', applicationId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          if (error.code === '42P01') {
            // Table doesn't exist, silently handle
            setTableExists(false);
          } else {
            console.error('Error fetching user support status:', error);
          }
          setIsSupportedByUser(false);
        } else {
          setIsSupportedByUser(!!data);
        }
      } catch (error) {
        console.error('Error fetching user support status:', error);
        setIsSupportedByUser(false);
      }
    };

    getSupportStatus();
  }, [applicationId, user, tableExists]);

  return {
    supportCount,
    isSupportedByUser,
    isLoading,
    tableExists
  };
};
