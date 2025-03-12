
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/auth-helpers-react";

export const useUserSupport = (applicationId: number, user: User | null) => {
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSupport = async () => {
      if (!user) {
        setIsSupportedByUser(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('application_supports')
          .select('id')
          .eq('application_id', applicationId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          // This could be a "no rows returned" error which is expected
          // if the user hasn't supported the application
          setIsSupportedByUser(false);
        } else {
          setIsSupportedByUser(!!data);
        }
      } catch (error) {
        console.error('Error checking user support:', error);
        setIsSupportedByUser(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSupport();
  }, [applicationId, user]);

  return { isSupportedByUser, isLoading };
};
