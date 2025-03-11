
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "@/hooks/use-error-handler";

export const useSupportState = (applicationId: number, user: any) => {
  const [supportCount, setSupportCount] = useState(0);
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableExists, setTableExists] = useState(false);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchSupportCount = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the support count from crystal_roof table
        const { data, error } = await supabase
          .from('crystal_roof')
          .select('support_count')
          .eq('id', applicationId)
          .single();
        
        if (error) {
          console.error('Error fetching support count:', error);
          setSupportCount(0);
        } else if (data) {
          setSupportCount(data.support_count || 0);
        }
        
        // For now, we're not tracking which users supported which applications
        // So we'll just set isSupportedByUser to false
        setIsSupportedByUser(false);
        
        setTableExists(true);
      } catch (error) {
        handleError(error, {
          context: 'support state'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchSupportCount();
    }
  }, [applicationId, user]);

  return {
    supportCount,
    isSupportedByUser,
    isLoading,
    tableExists
  };
};
