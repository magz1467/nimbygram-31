
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface LoadMoreButtonProps {
  onLoadMore: () => Promise<void>;
  loadedCount: number;
  totalCount: number;
  isLastPage: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

export const LoadMoreButton = ({ 
  onLoadMore, 
  loadedCount, 
  totalCount, 
  isLastPage,
  hasError,
  onRetry
}: LoadMoreButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onRetry) {
      onRetry();
    }
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center py-8 border-t mt-6">
        <p className="text-sm text-gray-500 mb-4">
          Error loading more results
        </p>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleRetry}
          className="gap-2 px-8"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLastPage) {
    return (
      <div className="text-center py-6 border-t mt-6">
        <p className="text-sm text-gray-500">
          Showing all {loadedCount} results
        </p>
      </div>
    );
  }

  const remainingCount = totalCount - loadedCount;

  return (
    <div className="flex flex-col items-center py-8 border-t mt-6">
      <Button 
        variant="outline" 
        size="lg" 
        onClick={handleLoadMore}
        className="gap-2 px-8 mb-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading more...
          </div>
        ) : (
          <>
            See More Results ({remainingCount > 10 ? 10 : remainingCount})
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </Button>
      <div className="text-sm text-gray-500 self-center">
        Showing {loadedCount} of {totalCount} results
      </div>
    </div>
  );
};
