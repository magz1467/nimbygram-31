
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "@/hooks/use-error-handler";

export const useSupportState = (applicationId: number, user: any) => {
  const [supportCount, setSupportCount] = useState(0);
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const { handleError, isNonCritical } = useErrorHandler();

  useEffect(() => {
    const checkSupportCount = async () => {
      try {
        setIsLoading(true);
        
        // Check if support_count column exists in crystal_roof table
        const { data: columnExists, error: columnCheckError } = await supabase.rpc(
          'check_column_exists',
          { table_name: 'crystal_roof', column_name: 'support_count' }
        );
        
        if (columnCheckError) {
          console.warn('Could not check if column exists:', columnCheckError);
          // Fall back to trying the query
        } else if (!columnExists) {
          console.log('Support count column does not exist, using default values');
          setSupportCount(0);
          setIsSupportedByUser(false);
          setTableExists(false);
          setIsLoading(false);
          return;
        }
        
        // Try to fetch the support count
        const { data, error } = await supabase
          .from('crystal_roof')
          .select('support_count')
          .eq('id', applicationId)
          .single();
        
        if (error) {
          // If the error is about support_count column not existing, it's non-critical
          if (error.message.includes('support_count') || isNonCritical(error)) {
            console.log('Support count not available, using default values');
            setSupportCount(0);
            setIsSupportedByUser(false);
            setTableExists(false);
          } else {
            throw error;
          }
        } else if (data) {
          setSupportCount(data.support_count || 0);
          setTableExists(true);
          
          // For now, we're not tracking which users supported which applications
          // So we'll just set isSupportedByUser to false
          setIsSupportedByUser(false);
        }
      } catch (error) {
        if (!isNonCritical(error)) {
          handleError(error, {
            context: 'support state'
          });
        }
        setSupportCount(0);
        setIsSupportedByUser(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      checkSupportCount();
    }
  }, [applicationId, user, handleError, isNonCritical]);

  return {
    supportCount,
    isSupportedByUser,
    isLoading,
    tableExists
  };
};
