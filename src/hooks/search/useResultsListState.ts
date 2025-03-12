
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

  // Track if loading has ever started
  useEffect(() => {
    if (isLoading && !hasStartedLoading) {
      setHasStartedLoading(true);
      setInitialLoadComplete(false);
      searchStartTimeRef.current = Date.now();
    }
    
    // Only mark initial load as complete when we get results or a definitive empty state
    // after loading has finished with a slight delay to ensure UI updates smoothly
    if (!isLoading && hasStartedLoading && !initialLoadComplete) {
      const delay = applications.length > 0 ? 100 : 1000; // Longer delay for empty results
      
      setTimeout(() => {
        setInitialLoadComplete(true);
      }, delay);
    }
  }, [isLoading, hasStartedLoading, initialLoadComplete, applications.length]);

  // Reset search timer when a new search starts
  useEffect(() => {
    if (isLoading) {
      searchStartTimeRef.current = Date.now();
      setIsLongSearchDetected(false);
      setShowErrorMessage(false);
      
      // Show "long search" message after 8 seconds - early enough to set expectations
      // but not so early it creates anxiety
      const timeoutId = setTimeout(() => {
        setIsLongSearchDetected(true);
      }, 8000);
      
      // Only show error message after 20 seconds if we're still loading 
      // and have no results - long enough to be patient but not so long users leave
      const errorTimeoutId = setTimeout(() => {
        if (applications.length === 0) {
          setShowErrorMessage(true);
        }
      }, 20000);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(errorTimeoutId);
      };
    }
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
