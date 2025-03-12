
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ErrorType } from "@/utils/errors";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  errorType?: ErrorType;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Error",
  message = "An error occurred while fetching results.",
  onRetry,
  errorType
}) => {
  // Choose appropriate messaging based on error type
  let errorMessage = message;
  let errorTitle = title;
  
  if (errorType === ErrorType.TIMEOUT) {
    errorTitle = "Search Timeout";
    errorMessage = "The search took too long to complete. Please try a more specific location or different filters.";
  } else if (errorType === ErrorType.NETWORK) {
    errorTitle = "Network Error";
    errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
  } else if (errorType === ErrorType.NOT_FOUND) {
    errorTitle = "No Results Found";
    errorMessage = "We couldn't find any planning applications for this search. Please try a different location or filters.";
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          
          <h3 className="text-lg font-medium text-amber-800">
            {errorTitle}
          </h3>
          
          <p className="text-amber-700 text-sm">
            {errorMessage}
          </p>
          
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
