
import { Clock, Search } from "lucide-react";
import { LoadingSkeletons } from "./LoadingSkeletons";

interface LoadingStateProps {
  isLongSearchDetected: boolean;
  onRetry?: () => void;
  showErrorMessage: boolean;
  error: Error | null;
  searchTerm?: string;
  displayTerm?: string;
}

export const LoadingState = ({ 
  isLongSearchDetected, 
  onRetry, 
  showErrorMessage, 
  error,
  searchTerm,
  displayTerm
}: LoadingStateProps) => {
  const locationTerm = displayTerm || searchTerm || 'this location';
  
  return (
    <div>
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Search className="h-10 w-10 text-primary" />
            <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <h3 className="text-lg font-medium">Searching for planning applications...</h3>
        <p className="text-sm text-muted-foreground">
          Looking for applications near {locationTerm}
        </p>
        <div className="flex items-center justify-center space-x-2 mt-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "600ms" }}></div>
        </div>
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
