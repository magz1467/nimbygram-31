
import { Clock, Search } from "lucide-react";
import { LoadingSkeletons } from "./LoadingSkeletons";

interface LoadingStateProps {
  isLongSearchDetected: boolean;
  onRetry?: () => void;
  showErrorMessage: boolean;
  error: Error | null;
}

export const LoadingState = ({ 
  isLongSearchDetected, 
  onRetry, 
  showErrorMessage, 
  error 
}: LoadingStateProps) => {
  return (
    <div>
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-2">
          <Search className="animate-pulse h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Searching for planning applications...</h3>
        <p className="text-sm text-muted-foreground">
          Results will appear as soon as they're found
        </p>
      </div>
      
      <LoadingSkeletons isLongSearch={isLongSearchDetected} onRetry={onRetry} />
      
      {isLongSearchDetected && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-amber-800 font-medium mb-1">Still searching...</h3>
              <p className="text-sm text-amber-700">
                We're looking for planning applications in this area. This may take a minute, but results will appear as soon as they're ready.
              </p>
              <p className="text-sm text-amber-700 mt-2">
                Planning applications will be displayed as they're found - please don't refresh the page.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showErrorMessage && error && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-lg mx-auto">
          <h3 className="text-amber-800 font-medium mb-1">Search is taking longer than expected</h3>
          <p className="text-sm text-amber-700 mb-2">
            There might be many applications to process. Initial results will appear as they become available.
          </p>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              Retry with current search
            </button>
          )}
        </div>
      )}
    </div>
  );
};
