
import { Button } from "@/components/ui/button";
import { Search, RotateCw } from "lucide-react";

interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
  showCoverageInfo?: boolean;
  variant?: 'default' | 'inline' | 'toast';
  className?: string;
}

export const ErrorMessage = ({ 
  title, 
  message, 
  onRetry,
  showCoverageInfo = true,
  variant = 'default',
  className = ''
}: ErrorMessageProps) => {
  // Skip rendering if message contains known ignorable patterns
  const shouldSkipRendering = () => {
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes('relation') && 
      lowerMessage.includes('does not exist') && 
      lowerMessage.includes('table')
    );
  };

  // If this is a non-critical error we want to completely skip rendering
  if (shouldSkipRendering()) {
    console.log('Skipping error display for non-critical error:', message);
    return null;
  }

  // Check if this is a timeout error and provide more specific guidance
  const isTimeoutError = message.includes('timeout') || message.includes('57014') || 
                         message.includes('took too long');
  const errorMessage = isTimeoutError 
    ? "The search is taking too long. Please try a more specific location or different filters."
    : message;
  
  const errorTitle = isTimeoutError ? "Search Timeout" : title;

  // For inline variants, use a more compact layout
  if (variant === 'inline') {
    return (
      <div className={`my-4 p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
        <h3 className="text-base font-semibold text-red-800 mb-1">{errorTitle}</h3>
        <p className="text-sm text-red-700 mb-2">{errorMessage}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRetry}
            className="mt-1 text-xs flex items-center gap-1"
          >
            <RotateCw className="h-3 w-3" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // For toast-style errors, use a more prominent design
  if (variant === 'toast') {
    return (
      <div className={`p-4 bg-red-500 text-white rounded-md shadow-lg ${className}`}>
        <h3 className="font-semibold mb-1">{errorTitle}</h3>
        <p className="text-sm opacity-90 mb-2">{errorMessage}</p>
        {onRetry && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onRetry}
            className="mt-1 bg-white text-red-600 hover:bg-red-50 flex items-center gap-1"
          >
            <RotateCw className="h-3 w-3" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Default full error display
  return (
    <div className={`mt-8 text-center flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 max-w-2xl mx-auto ${className}`}>
      <Search className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{errorTitle}</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md mx-auto">{errorMessage}</p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        
        <Button 
          variant="default" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          Go Back
        </Button>
      </div>
      
      {showCoverageInfo && (
        <div className="mt-6 p-4 bg-white rounded border border-amber-200 max-w-md">
          <h4 className="font-medium text-amber-800 mb-2">Coverage Information</h4>
          <p className="text-sm text-gray-600">
            Our planning application database currently has the best coverage in Greater London and the South East of England. 
            We're working to expand our coverage to more areas of the UK.
          </p>
        </div>
      )}
    </div>
  );
};
