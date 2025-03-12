
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
      if (!applicationId) {
        setIsLoading(false);
        return;
      }
      
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
          setSupportCount(0);
          setIsSupportedByUser(false);
          setTableExists(false);
          setIsLoading(false);
          return;
        }
        
        if (!columnExists) {
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
          if (error.message && 
              (error.message.includes('support_count') || 
               isNonCritical(error))) {
            console.log('Support count not available, using default values');
            setSupportCount(0);
            setIsSupportedByUser(false);
            setTableExists(false);
          } else {
            console.error('Error fetching support count:', error);
            setSupportCount(0);
            setIsSupportedByUser(false);
          }
        } else if (data) {
          // Handle case where data exists but support_count might be null
          const count = data.support_count !== null ? data.support_count : 0;
          setSupportCount(count);
          setTableExists(true);
          
          // For now, we're not tracking which users supported which applications
          setIsSupportedByUser(false);
        } else {
          // No data returned, set defaults
          setSupportCount(0);
          setIsSupportedByUser(false);
        }
      } catch (error) {
        console.error('Error in useSupportState:', error);
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
