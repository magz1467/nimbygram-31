
import { useState, useEffect } from "react";
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
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Track if loading has ever started to prevent showing "no results" too early
  useEffect(() => {
    if (isLoading && !hasStartedLoading) {
      setHasStartedLoading(true);
      setInitialLoadComplete(false);
    }
    
    // When loading completes after having started, mark initial load as complete
    if (!isLoading && hasStartedLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [isLoading, hasStartedLoading, initialLoadComplete]);

  // Reset search timer when a new search starts
  useEffect(() => {
    if (isLoading) {
      setSearchStartTime(Date.now());
      setIsLongSearchDetected(false);
      setShowErrorMessage(false);
      
      // After 5 seconds of loading, show "long search" message
      const timeoutId = setTimeout(() => {
        setIsLongSearchDetected(true);
      }, 5000);
      
      // Only show error message after 30 seconds if we're still loading 
      // and have no results
      const errorTimeoutId = setTimeout(() => {
        if (applications.length === 0) {
          setShowErrorMessage(true);
        }
      }, 30000);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(errorTimeoutId);
      };
    } else {
      setSearchStartTime(null);
    }
  }, [isLoading, applications.length]);

  // Update loaded applications when the applications array changes
  useEffect(() => {
    if (applications && applications.length > 0 && !isLoading) {
      // Hide any error messages if we got results
      setShowErrorMessage(false);
      
      if (currentPage === 0) {
        setLoadedApplications(applications.slice(0, pageSize));
      } else {
        setLoadedApplications(prev => {
          const existingIds = new Set(prev.map(app => app.id));
          const uniqueNewApps = applications
            .slice(0, (currentPage + 1) * pageSize)
            .filter(app => !existingIds.has(app.id));
          return [...prev, ...uniqueNewApps];
        });
      }
    }
  }, [applications, currentPage, isLoading, pageSize]);

  const handleLoadMore = async () => {
    if (onPageChange && currentPage < Math.ceil(applications.length / pageSize) - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const isLastPage = loadedApplications.length >= applications.length;

  return {
    loadedApplications,
    isLongSearchDetected,
    showErrorMessage,
    hasStartedLoading,
    initialLoadComplete,
    isLastPage,
    handleLoadMore
  };
};
