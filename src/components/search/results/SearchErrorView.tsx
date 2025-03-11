
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
      <ErrorMessage 
        title={errorType === ErrorType.TIMEOUT ? "Search took too long" : "Search Error"} 
        message={errorDetails}
        errorType={errorType}
        onRetry={onRetry}
        showCoverageInfo={true}
        variant="default"
      />
      
      {onRetry && (
        <div className="mt-6">
          <Button 
            onClick={onRetry} 
            variant="default" 
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
        </div>
      )}
    </div>
  );
};
