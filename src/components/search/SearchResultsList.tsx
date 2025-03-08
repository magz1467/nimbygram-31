
import { Application } from "@/types/planning";
import { SearchResultCard } from "./SearchResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SearchResultsListProps {
  applications: Application[];
  isLoading: boolean;
  onSeeOnMap?: (id: number) => void;
  searchTerm?: string;
  onRetry?: () => void;
}

export const SearchResultsList = ({ 
  applications, 
  isLoading, 
  onSeeOnMap,
  searchTerm,
  onRetry
}: SearchResultsListProps) => {
  const [displayCount, setDisplayCount] = useState(10);
  const [loadProgress, setLoadProgress] = useState(33);
  const { toast } = useToast();

  const displayedApplications = applications.slice(0, displayCount);
  const hasMore = displayCount < applications.length;

  // Simulate progress for better user experience
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setLoadProgress(100);
    }
  }, [isLoading]);

  // Report search issues for monitoring
  useEffect(() => {
    if (!isLoading && applications.length === 0 && searchTerm) {
      // Log this for tracking purposes
      console.warn(`Zero results found for "${searchTerm}"`);
    }
  }, [isLoading, applications.length, searchTerm]);

  const handleSeeMore = () => {
    setDisplayCount(prevCount => prevCount + 10);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center">
          <Progress value={loadProgress} className="w-[60%] mb-2" />
          <p className="text-sm text-muted-foreground">Loading planning applications...</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-[300px] w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!applications.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex items-center justify-center">
          <AlertTriangle className="text-amber-500 mr-2 h-5 w-5" />
          <p className="text-gray-700">No planning applications found in this area.</p>
        </div>
        <p className="text-sm text-gray-500 px-4 max-w-md mx-auto">
          There may be issues with our database connection or no applications exist in this specific location.
        </p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-4 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8">
        {displayedApplications.map((application) => (
          <SearchResultCard 
            key={application.id} 
            application={application}
            onSeeOnMap={onSeeOnMap}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleSeeMore}
            className="flex items-center gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            See More ({applications.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};
