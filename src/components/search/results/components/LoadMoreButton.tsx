
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface LoadMoreButtonProps {
  onLoadMore: () => Promise<void>;
  loadedCount: number;
  totalCount: number;
  isLastPage: boolean;
}

export const LoadMoreButton = ({ 
  onLoadMore, 
  loadedCount, 
  totalCount, 
  isLastPage 
}: LoadMoreButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLastPage) {
    return (
      <div className="text-center py-6 border-t mt-6">
        <p className="text-sm text-gray-500">
          Showing all {loadedCount} results
        </p>
      </div>
    );
  }

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
            See More Results
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
