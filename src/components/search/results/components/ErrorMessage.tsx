
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, RotateCw, AlertTriangle, WifiOff, Clock } from "lucide-react";
import { ErrorType, isNonCriticalError } from "@/utils/errors";

interface ErrorMessageProps {
  title: string;
  message: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  showCoverageInfo?: boolean;
  variant?: 'default' | 'inline' | 'toast';
  className?: string;
}

export const ErrorMessage = ({ 
  title, 
  message, 
  errorType = ErrorType.UNKNOWN,
  onRetry,
  showCoverageInfo = true,
  variant = 'default',
  className = ''
}: ErrorMessageProps) => {
  // Skip rendering if message contains known ignorable patterns
  if (typeof message === 'string' && isNonCriticalError(message)) {
    console.log('Skipping error display for non-critical error:', message);
    return null;
  }
  
  // Select appropriate icon based on error type
  const Icon = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return <WifiOff className={variant === 'default' ? "h-12 w-12 text-gray-400 mb-4" : "h-5 w-5 text-red-600"} />;
      case ErrorType.TIMEOUT:
        return <Clock className={variant === 'default' ? "h-12 w-12 text-gray-400 mb-4" : "h-5 w-5 text-amber-600"} />;
      case ErrorType.NOT_FOUND:
        return <Search className={variant === 'default' ? "h-12 w-12 text-gray-400 mb-4" : "h-5 w-5 text-blue-600"} />;
      default:
        return variant === 'default' 
          ? <Search className="h-12 w-12 text-gray-400 mb-4" /> 
          : <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getBackgroundColor = () => {
    if (variant !== 'inline') return '';
    
    switch (errorType) {
      case ErrorType.TIMEOUT:
        return 'bg-amber-50 border-amber-200';
      case ErrorType.NETWORK:
        return 'bg-red-50 border-red-200';
      case ErrorType.NOT_FOUND:
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (errorType) {
      case ErrorType.TIMEOUT:
        return 'text-amber-800';
      case ErrorType.NETWORK:
        return 'text-red-800';
      case ErrorType.NOT_FOUND:
        return 'text-blue-800';
      default:
        return 'text-red-800';
    }
  };

  // Log error for analytics
  React.useEffect(() => {
    if (errorType !== ErrorType.NOT_FOUND) {
      console.info('UI Error displayed:', {
        title,
        message,
        errorType,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    }
  }, [title, message, errorType]);

  // For inline variants, use a more compact layout
  if (variant === 'inline') {
    return (
      <div className={`my-4 p-4 border rounded-md ${getBackgroundColor()} ${className}`}>
        <div className="flex items-start">
          <Icon />
          <div className="ml-3">
            <h3 className={`text-base font-semibold ${getTextColor()} mb-1`}>{title}</h3>
            <p className="text-sm text-gray-700 mb-2">{message}</p>
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
        </div>
      </div>
    );
  }

  // For toast-style errors, use a more prominent design
  if (variant === 'toast') {
    const toastBgColor = errorType === ErrorType.TIMEOUT ? 'bg-amber-500' : 'bg-red-500';
    
    return (
      <div className={`p-4 ${toastBgColor} text-white rounded-md shadow-lg ${className}`}>
        <div className="flex items-start">
          <Icon />
          <div className="ml-3">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm opacity-90 mb-2">{message}</p>
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
        </div>
      </div>
    );
  }

  // Default full error display
  return (
    <div className={`mt-8 text-center flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 max-w-2xl mx-auto ${className}`}>
      <Icon />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md mx-auto">{message}</p>
      
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
      
      {showCoverageInfo && errorType !== ErrorType.NETWORK && (
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
