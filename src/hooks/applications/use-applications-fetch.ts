
import { useQuery } from '@tanstack/react-query';
import { Application } from '@/types/planning';
import { supabase } from '@/integrations/supabase/client';
import { transformApplicationFromDatabase } from '@/services/applications/transforms/applications-transformer';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';

/**
 * Hook for fetching applications data
 */
export const useApplicationsFetch = (
  filters: Record<string, any> = {},
  enabled = true,
  queryOptions = {}
) => {
  return useQuery({
    queryKey: ['applications', JSON.stringify(filters)],
    queryFn: async () => {
      try {
        // Log telemetry
        searchTelemetry.logEvent(TelemetryEventType.SEARCH_STARTED, {
          filters
        });
        
        // Build query
        let query = supabase.from('crystal_roof').select('*');
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            if (typeof value === 'string') {
              query = query.ilike(key, `%${value}%`);
            } else {
              query = query.eq(key, value);
            }
          }
        });
        
        // Limit results
        query = query.limit(100);
        
        // Execute query
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform data to application objects
        const applications = (data || [])
          .map(app => transformApplicationFromDatabase(app))
          .filter(Boolean) as Application[];
        
        // Log telemetry
        searchTelemetry.logEvent(TelemetryEventType.SEARCH_COMPLETED, {
          filters,
          resultCount: applications.length
        });
        
        return applications;
      } catch (error) {
        console.error('Error fetching applications:', error);
        
        // Log telemetry
        searchTelemetry.logEvent(TelemetryEventType.SEARCH_ERROR, {
          filters,
          errorMessage: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
};
