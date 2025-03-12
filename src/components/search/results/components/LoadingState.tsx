
import { Clock } from "lucide-react";
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
      <LoadingSkeletons isLongSearch={isLongSearchDetected} onRetry={onRetry} />
      
      {isLongSearchDetected && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-amber-800 font-medium mb-1">This search is taking longer than usual</h3>
              <p className="text-sm text-amber-700">
                We're still looking for planning applications in this area. The first results will appear as soon as they're ready.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showErrorMessage && error && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-lg mx-auto">
          <h3 className="text-amber-800 font-medium mb-1">Search is still in progress</h3>
          <p className="text-sm text-amber-700 mb-2">
            We're experiencing some delays with this search. Initial results may show up soon, or you can try a more specific location.
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
