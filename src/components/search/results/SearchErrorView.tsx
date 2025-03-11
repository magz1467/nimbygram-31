
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { RotateCw, AlertTriangle, WifiOff, Clock } from "lucide-react";
import { ErrorType } from "@/utils/errors";

interface SearchErrorViewProps {
  errorDetails: string | null;
  errorType?: ErrorType;
  onRetry: () => void;
}

export const SearchErrorView = ({ 
  errorDetails, 
  errorType = ErrorType.UNKNOWN,
  onRetry 
}: SearchErrorViewProps) => {
  // Select the appropriate icon based on error type
  const ErrorIcon = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return <WifiOff className="h-16 w-16 text-red-500 mb-4" />;
      case ErrorType.TIMEOUT:
        return <Clock className="h-16 w-16 text-amber-500 mb-4" />;
      default:
        return <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />;
    }
  };

  // Get a title based on error type
  const getErrorTitle = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return "Connection Problem";
      case ErrorType.TIMEOUT:
        return "Search Timeout";
      case ErrorType.NOT_FOUND:
        return "No Results Found";
      default:
        return "Search Error";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <ErrorIcon />
        <h2 className="text-2xl font-bold mb-4">{getErrorTitle()}</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {errorDetails || 'We had trouble finding planning applications for this location.'}
        </p>
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RotateCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
};
