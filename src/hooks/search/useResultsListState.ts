
import { useState, useEffect, useRef } from "react";
import { Application } from "@/types/planning";

interface ResultsListStateProps {
  applications: Application[];
  isLoading: boolean;
  error: Error | null;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const useResultsListState = ({
  applications,
  isLoading,
  error,
  pageSize = 10,
  currentPage = 0,
  onPageChange
}: ResultsListStateProps) => {
  const [loadedApplications, setLoadedApplications] = useState<Application[]>([]);
  const [isLongSearchDetected, setIsLongSearchDetected] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const searchStartTimeRef = useRef<number | null>(null);
  const initialResultsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longSearchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const errorMessageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minLoadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if loading has ever started
  useEffect(() => {
    if (isLoading && !hasStartedLoading) {
      setHasStartedLoading(true);
      setInitialLoadComplete(false);
      searchStartTimeRef.current = Date.now();
      
      // Clear any existing timers
      if (initialResultsTimerRef.current) clearTimeout(initialResultsTimerRef.current);
      if (longSearchTimerRef.current) clearTimeout(longSearchTimerRef.current);
      if (errorMessageTimerRef.current) clearTimeout(errorMessageTimerRef.current);
      if (minLoadingTimerRef.current) clearTimeout(minLoadingTimerRef.current);
      
      // Set minimum loading time to prevent flickering
      minLoadingTimerRef.current = setTimeout(() => {
        // This timer ensures we show loading state for at least 1.5 seconds
        minLoadingTimerRef.current = null;
      }, 1500);
    }
    
    // Only mark initial load as complete when we get results or a definitive empty state
    // after loading has finished with a SIGNIFICANT delay to ensure UI updates smoothly
    if (!isLoading && hasStartedLoading && !initialLoadComplete) {
      // Clear any previous timer
      if (initialResultsTimerRef.current) {
        clearTimeout(initialResultsTimerRef.current);
      }
      
      // Use much longer delays to prevent premature "no results" display
      // - For results: wait 2 seconds
      // - For empty results: wait 15 seconds to ensure search is truly done
      const delay = applications.length > 0 ? 2000 : 15000;
      
      initialResultsTimerRef.current = setTimeout(() => {
        setInitialLoadComplete(true);
        initialResultsTimerRef.current = null;
      }, delay);
    }

    return () => {
      // Clear timers on unmount or when dependencies change
      if (initialResultsTimerRef.current) clearTimeout(initialResultsTimerRef.current);
      if (longSearchTimerRef.current) clearTimeout(longSearchTimerRef.current);
      if (errorMessageTimerRef.current) clearTimeout(errorMessageTimerRef.current);
      if (minLoadingTimerRef.current) clearTimeout(minLoadingTimerRef.current);
    };
  }, [isLoading, hasStartedLoading, initialLoadComplete, applications.length]);

  // Reset search timer when a new search starts
  useEffect(() => {
    if (isLoading) {
      searchStartTimeRef.current = Date.now();
      setIsLongSearchDetected(false);
      setShowErrorMessage(false);
      
      // Clear any existing timers
      if (longSearchTimerRef.current) clearTimeout(longSearchTimerRef.current);
      if (errorMessageTimerRef.current) clearTimeout(errorMessageTimerRef.current);
      
      // Show "long search" message after 8 seconds - early enough to set expectations
      longSearchTimerRef.current = setTimeout(() => {
        setIsLongSearchDetected(true);
        longSearchTimerRef.current = null;
      }, 8000);
      
      // Only show error message after 25 seconds if we're still loading 
      // and have no results - long enough to be patient but not so long users leave
      errorMessageTimerRef.current = setTimeout(() => {
        if (applications.length === 0) {
          setShowErrorMessage(true);
          errorMessageTimerRef.current = null;
        }
      }, 25000);
    }
    
    return () => {
      if (longSearchTimerRef.current) clearTimeout(longSearchTimerRef.current);
      if (errorMessageTimerRef.current) clearTimeout(errorMessageTimerRef.current);
    };
  }, [isLoading, applications.length]);

  // Update loaded applications when the applications array changes
  useEffect(() => {
    if (applications && applications.length > 0) {
      setShowErrorMessage(false);
      
      // For first page, just show the first pageSize results
      if (currentPage === 0) {
        setLoadedApplications(applications.slice(0, pageSize));
      } else {
        // For subsequent pages, append new unique applications
        setLoadedApplications(prev => {
          const existingIds = new Set(prev.map(app => app.id));
          const uniqueNewApps = applications
            .slice(0, (currentPage + 1) * pageSize)
            .filter(app => !existingIds.has(app.id));
          return [...prev, ...uniqueNewApps];
        });
      }
    }
  }, [applications, currentPage, pageSize]);

  const handleLoadMore = async () => {
    if (onPageChange && currentPage < Math.ceil(applications.length / pageSize) - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const isLastPage = loadedApplications.length >= applications.length;
  const searchDuration = searchStartTimeRef.current ? Date.now() - searchStartTimeRef.current : 0;

  return {
    loadedApplications,
    isLongSearchDetected,
    showErrorMessage,
    hasStartedLoading,
    initialLoadComplete,
    isLastPage,
    handleLoadMore,
    searchDuration
  };
};
