
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface LoadingSkeletonsProps {
  isLongSearch: boolean;
  onRetry?: () => void;
}

export const LoadingSkeletons = ({ isLongSearch, onRetry }: LoadingSkeletonsProps) => {
  return (
    <div className="space-y-6 py-8">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="bg-white rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto h-[300px] animate-pulse"
        >
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
      
      {/* Show message for long-running searches */}
      {isLongSearch && (
        <div className="text-center mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
          <h4 className="text-amber-800 font-medium">Search taking longer than usual</h4>
          <p className="text-amber-700 text-sm mt-1">
            We're still looking for applications in this area. This might be a busy area with many applications.
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="mt-3 gap-2">
              <RotateCw className="h-3 w-3" />
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
