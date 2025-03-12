
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/auth-helpers-react";

// Cache the column check result
let hasCheckedColumn = false;
let columnExists = false;

const checkSupportCount = async () => {
  if (hasCheckedColumn) {
    return columnExists;
  }

  try {
    const { data, error } = await supabase
      .rpc('check_column_exists', {
        column_name: 'support_count',
        table_name: 'crystal_roof'
      });

    if (error) {
      console.warn('Could not check if column exists:', error);
      return false;
    }

    hasCheckedColumn = true;
    columnExists = !!data;
    return columnExists;
  } catch (err) {
    console.warn('Could not check if column exists:', err);
    return false;
  }
};

export const useSupportState = (applicationId: number, user: User | null) => {
  const [supportCount, setSupportCount] = useState(0);
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);

  useEffect(() => {
    const fetchSupport = async () => {
      const exists = await checkSupportCount();
      if (!exists) return;

      try {
        const { data: count } = await supabase
          .from('crystal_roof')
          .select('support_count')
          .eq('id', applicationId)
          .single();

        setSupportCount(count?.support_count || 0);

        if (user) {
          const { data: userSupport } = await supabase
            .from('application_supports')
            .select('id')
            .eq('application_id', applicationId)
            .eq('user_id', user.id)
            .single();

          setIsSupportedByUser(!!userSupport);
        }
      } catch (error) {
        console.error('Error fetching support count:', error);
      }
    };

    fetchSupport();
  }, [applicationId, user]);

  return {
    supportCount,
    isSupportedByUser
  };
};
