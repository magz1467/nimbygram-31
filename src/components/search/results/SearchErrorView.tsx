
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Clock } from "lucide-react";
import { ErrorMessage } from "./components/ErrorMessage";
import { ErrorType } from "@/utils/errors";

interface SearchErrorViewProps {
  errorDetails: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const SearchErrorView = ({ 
  errorDetails, 
  errorType = ErrorType.UNKNOWN, 
  onRetry,
  isRetrying = false
}: SearchErrorViewProps) => {
  const isTimeoutError = errorType === ErrorType.TIMEOUT || 
    errorDetails.includes('timeout') || 
    errorDetails.includes('too long');
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
      <div className="text-center mb-6">
        {isTimeoutError ? (
          <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        ) : (
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        )}
        
        <h2 className="text-2xl font-semibold mb-2">
          {isTimeoutError ? "Search Timed Out" : "Search Error"}
        </h2>
        
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {isTimeoutError 
            ? "We're having trouble searching this large area. Please try a more specific location or use filters to narrow your search." 
            : errorDetails}
        </p>
      </div>
      
      {onRetry && (
        <div className="flex gap-4">
          <Button 
            onClick={onRetry} 
            variant={isTimeoutError ? "outline" : "default"}
            disabled={isRetrying}
            className="flex items-center gap-2"
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
          
          <Button 
            onClick={() => window.history.back()} 
            variant={isTimeoutError ? "default" : "outline"}
          >
            Go Back
          </Button>
        </div>
      )}
      
      {isTimeoutError && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-md text-sm text-amber-800">
          <p className="font-medium mb-1">Search Tips:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Try searching for a specific postcode instead of a town or city</li>
            <li>Use the filters to narrow down by application type or status</li>
            <li>Search for a specific street or neighborhood</li>
          </ul>
        </div>
      )}
    </div>
  );
};
