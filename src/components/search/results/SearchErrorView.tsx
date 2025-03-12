
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { RotateCw, AlertTriangle, WifiOff, Clock, Search, Info, Database } from "lucide-react";
import { ErrorType } from "@/utils/errors";
import { useState } from "react";

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
  const [showDetails, setShowDetails] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Select the appropriate icon based on error type
  const ErrorIcon = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return <WifiOff className="h-16 w-16 text-red-500 mb-4" />;
      case ErrorType.TIMEOUT:
        return <Clock className="h-16 w-16 text-amber-500 mb-4" />;
      case ErrorType.NOT_FOUND:
        return <Search className="h-16 w-16 text-blue-500 mb-4" />;
      case ErrorType.DATABASE:
        return <Database className="h-16 w-16 text-red-500 mb-4" />;
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
      case ErrorType.DATABASE:
        return "Database Error";
      default:
        return "Search Error";
    }
  };

  // Get a helpful message based on error type
  const getErrorMessage = () => {
    if (errorDetails) return errorDetails;
    
    switch (errorType) {
      case ErrorType.NETWORK:
        return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
      case ErrorType.TIMEOUT:
        return "The search took too long to complete. Please try a more specific location or different filters.";
      case ErrorType.NOT_FOUND:
        return "We couldn't find any planning applications matching your search criteria.";
      case ErrorType.DATABASE:
        return "Our database is currently experiencing high demand. Please try a more specific search or try again later.";
      default:
        return "We had trouble finding planning applications for this location.";
    }
  };
  
  // Get suggestions based on error type
  const getSuggestions = () => {
    switch (errorType) {
      case ErrorType.TIMEOUT:
        return [
          "Use a more specific location (e.g., full postcode instead of just 'Bath')",
          "Try adding filters like application status or type",
          "Search for a smaller area or specific street name"
        ];
      case ErrorType.NOT_FOUND:
        return [
          "Check if you typed the location correctly",
          "Try a nearby location",
          "Expand your search by using a more general area name"
        ];
      case ErrorType.NETWORK:
        return [
          "Check your internet connection",
          "Try again in a few minutes",
          "If the problem persists, contact support"
        ];
      case ErrorType.DATABASE:
        return [
          "Use a more specific search term to reduce database load",
          "Try again during off-peak hours",
          "Add filters to narrow your search"
        ];
      default:
        return [
          "Try a different search term",
          "Check your spelling",
          "Try again later"
        ];
    }
  };
  
  // Gather system diagnostics
  const getDiagnostics = () => {
    return {
      browser: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      memory: (window.performance as any)?.memory ? {
        jsHeapSizeLimit: formatBytes((window.performance as any).memory.jsHeapSizeLimit),
        totalJSHeapSize: formatBytes((window.performance as any).memory.totalJSHeapSize),
        usedJSHeapSize: formatBytes((window.performance as any).memory.usedJSHeapSize)
      } : 'Not available',
      connection: (navigator as any)?.connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
        saveData: (navigator as any).connection.saveData
      } : 'Not available'
    };
  };
  
  // Format bytes to human-readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <ErrorIcon />
        <h2 className="text-2xl font-bold mb-4">{getErrorTitle()}</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {getErrorMessage()}
        </p>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 max-w-md w-full">
          <h3 className="font-semibold text-lg mb-2">Suggestions:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="text-gray-700">{suggestion}</li>
            ))}
          </ul>
        </div>
        
        {errorDetails && (
          <div className="mb-6 w-full max-w-md">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 mb-2"
            >
              <Info size={16} />
              {showDetails ? "Hide Technical Details" : "Show Technical Details"}
            </Button>
            
            {showDetails && (
              <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                {errorDetails}
              </div>
            )}
          </div>
        )}
        
        <div className="mb-6 w-full max-w-md">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="flex items-center gap-2 mb-2"
          >
            <Info size={16} />
            {showDiagnostics ? "Hide System Information" : "Show System Information"}
          </Button>
          
          {showDiagnostics && (
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
              <pre>{JSON.stringify(getDiagnostics(), null, 2)}</pre>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
