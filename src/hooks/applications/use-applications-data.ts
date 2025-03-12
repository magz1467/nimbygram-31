
import { useState, useEffect } from 'react';
import { Application } from '@/types/planning';
import { StatusCounts } from '@/types/application-types';
import { useApplicationsFetch } from './use-applications-fetch';
import { useStatusCounts } from './use-status-counts';
import { handleError } from '@/utils/errors/centralized-handler';

export interface ApplicationsDataState {
  applications: Application[];
  filteredApplications: Application[];
  statusCounts: StatusCounts;
  loading: boolean;
  error: Error | null;
}

export function useApplicationsData(initialParams: any = {}) {
  const [state, setState] = useState<ApplicationsDataState>({
    applications: [],
    filteredApplications: [],
    statusCounts: {
      'Under Review': 0,
      'Approved': 0,
      'Declined': 0,
      'Other': 0
    },
    loading: true,
    error: null
  });

  const { fetchApplications } = useApplicationsFetch();
  const { fetchStatusCounts } = useStatusCounts();

  useEffect(() => {
    const loadApplicationsData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const [applications, statusCounts] = await Promise.all([
          fetchApplications(initialParams),
          fetchStatusCounts()
        ]);
        
        setState({
          applications,
          filteredApplications: applications,
          statusCounts,
          loading: false,
          error: null
        });
      } catch (err) {
        handleError(err);
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error('Failed to load applications data')
        }));
      }
    };
    
    loadApplicationsData();
  }, []);

  const filterApplications = (filters: Record<string, any>) => {
    setState(prev => {
      const filtered = prev.applications.filter(app => {
        // Apply status filter
        if (filters.status && filters.status !== 'All' && app.status !== filters.status) {
          return false;
        }
        
        // Apply type filter instead of classification
        if (filters.type && 
            filters.type !== 'All' && 
            app.type !== filters.type) {
          return false;
        }
        
        // Apply date range filter if needed
        if (filters.dateFrom && app.submissionDate && 
            new Date(app.submissionDate) < new Date(filters.dateFrom)) {
          return false;
        }
        
        if (filters.dateTo && app.submissionDate && 
            new Date(app.submissionDate) > new Date(filters.dateTo)) {
          return false;
        }
        
        return true;
      });
      
      return {
        ...prev,
        filteredApplications: filtered
      };
    });
  };

  return {
    ...state,
    filterApplications
  };
}
