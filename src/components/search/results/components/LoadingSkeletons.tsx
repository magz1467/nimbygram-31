
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface LoadingSkeletonsProps {
  count?: number;
  isLongSearch?: boolean;
  onRetry?: () => void;
}

export const LoadingSkeletons = ({ 
  count = 5, 
  isLongSearch = false,
  onRetry
}: LoadingSkeletonsProps) => {
  return (
    <div className="space-y-6 py-4">
      {isLongSearch && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
          <h3 className="font-medium text-amber-800 mb-1">This search is taking longer than usual</h3>
          <p className="text-sm text-amber-700 mb-4">
            We're still looking for planning applications in this area. You can continue waiting or try another search.
          </p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Try Again
            </Button>
          )}
        </div>
      )}
      
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 bg-gray-200 h-32 sm:h-auto"></div>
            <div className="p-4 sm:w-2/3 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="pt-2">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
