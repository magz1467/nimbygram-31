
import { useRouteError, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { HomeIcon, RefreshCw, AlertTriangle, WifiOff, FileX } from "lucide-react";
import { ErrorType, detectErrorType } from "@/utils/error-handler";

export function RouteErrorBoundary() {
  const error = useRouteError();
  console.error('Route error caught:', error);

  // Determine the type of error
  const errorType = detectErrorType(error);
  
  // Get appropriate icon based on error type
  const ErrorIcon = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return <WifiOff className="h-12 w-12 text-red-500 mb-4" />;
      case ErrorType.NOT_FOUND:
        return <FileX className="h-12 w-12 text-amber-500 mb-4" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />;
    }
  };
  
  // Get appropriate message based on error type
  const getErrorMessage = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return "We're having trouble connecting to our servers. Please check your internet connection.";
      case ErrorType.NOT_FOUND:
        return "The page you are looking for doesn't exist or has been moved.";
      default:
        return "Sorry, an unexpected error has occurred. Please try refreshing the page or going back home.";
    }
  };
  
  // Get appropriate title based on error type  
  const getErrorTitle = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return "Connection Error";
      case ErrorType.NOT_FOUND:
        return "Page Not Found";
      default:
        return "Oops!";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <ErrorIcon />
          <h1 className="text-4xl font-bold tracking-tight">{getErrorTitle()}</h1>
          <p className="text-lg text-muted-foreground">
            {getErrorMessage()}
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          
          <Button asChild>
            <Link to="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
