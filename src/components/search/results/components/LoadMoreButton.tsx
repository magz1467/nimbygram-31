
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loadedCount: number;
  totalCount: number;
  isLastPage: boolean;
  isLoading?: boolean;
}

export const LoadMoreButton = ({ 
  onLoadMore, 
  loadedCount, 
  totalCount, 
  isLastPage,
  isLoading = false 
}: LoadMoreButtonProps) => {
  if (isLastPage) return null;
  
  return (
    <div className="flex justify-center py-4">
      <Button
        onClick={onLoadMore}
        variant="outline"
        size="lg"
        disabled={isLoading || isLastPage}
        className="w-full max-w-md"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading more...
          </>
        ) : (
          `Load more (${loadedCount} of ${totalCount})`
        )}
      </Button>
    </div>
  );
};
