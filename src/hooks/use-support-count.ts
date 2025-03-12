
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useColumnExists } from "./use-column-exists";
import { User } from "@supabase/auth-helpers-react";

export const useSupportCount = (applicationId: number) => {
  const [supportCount, setSupportCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { exists: columnExists, isLoading: isColumnCheckLoading } = useColumnExists('crystal_roof', 'support_count');

  useEffect(() => {
    const fetchSupportCount = async () => {
      // Wait for column check to complete
      if (isColumnCheckLoading || !columnExists) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('crystal_roof')
          .select('support_count')
          .eq('id', applicationId)
          .single();

        if (error) {
          console.error('Error fetching support count:', error);
          setSupportCount(0);
        } else {
          setSupportCount(data?.support_count || 0);
        }
      } catch (error) {
        console.error('Error fetching support count:', error);
        setSupportCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupportCount();
  }, [applicationId, columnExists, isColumnCheckLoading]);

  return { supportCount, isLoading };
};
