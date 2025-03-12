
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errors/centralized-handler';
import { StatusCounts } from '@/types/application-types';

export function useStatusCounts() {
  const fetchStatusCounts = async (): Promise<StatusCounts> => {
    try {
      const { data, error } = await supabase
        .from('crystal_roof')
        .select('status')
        .not('status', 'is', null);

      if (error) throw error;

      // Initialize status counts with zeros
      const statusCounts: StatusCounts = {
        'Under Review': 0,
        'Approved': 0,
        'Declined': 0,
        'Other': 0
      };

      // Count applications by status
      (data || []).forEach(item => {
        const status = item.status || 'Other';
        if (status.includes('Review') || status.includes('Pending')) {
          statusCounts['Under Review']++;
        } else if (status.includes('Approved') || status.includes('Granted')) {
          statusCounts['Approved']++;
        } else if (status.includes('Declined') || status.includes('Refused') || status.includes('Rejected')) {
          statusCounts['Declined']++;
        } else {
          statusCounts['Other']++;
        }
      });

      return statusCounts;
    } catch (err) {
      handleError(err);
      return {
        'Under Review': 0,
        'Approved': 0,
        'Declined': 0,
        'Other': 0
      };
    }
  };

  return { fetchStatusCounts };
}
