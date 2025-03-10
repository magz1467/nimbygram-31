
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
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
    <div className="flex justify-center py-8 border-t mt-6">
      <Button 
        variant="outline" 
        size="lg" 
        onClick={onLoadMore}
        className="gap-2 px-8"
      >
        See More Results
        <ChevronDown className="h-4 w-4" />
      </Button>
      <div className="text-sm text-gray-500 ml-4 self-center">
        Showing {loadedCount} of {totalCount} results
      </div>
    </div>
  );
};
