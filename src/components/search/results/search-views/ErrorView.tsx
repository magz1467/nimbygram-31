
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/search/results/components/ErrorMessage";
import { ErrorType } from "@/utils/errors";

interface ErrorViewProps {
  error: Error;
  errorType: ErrorType;
  onRetry: () => void;
}

export function ErrorView({ error, errorType, onRetry }: ErrorViewProps) {
  // Different error titles based on error type
  const getErrorTitle = () => {
    switch (errorType) {
      case ErrorType.TIMEOUT:
        return "Search Timeout";
      case ErrorType.NETWORK:
        return "Connection Problem";
      case ErrorType.NOT_FOUND:
        return "No Results";
      default:
        return "Search Error";
    }
  };
  
  return (
    <div className="py-8">
      <ErrorMessage
        title={getErrorTitle()}
        message={error.message}
        errorType={errorType}
        onRetry={onRetry}
        showCoverageInfo={true}
      />
      
      <div className="mt-12 text-center">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Return to previous page
        </Button>
      </div>
    </div>
  );
}
