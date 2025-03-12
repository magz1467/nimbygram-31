
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle, WifiOff, Clock } from "lucide-react";
import { 
  ErrorType, 
  AppError, 
  formatErrorMessage, 
  detectErrorType, 
  createAppError 
} from '@/utils/errors';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  component?: string;
  onError?: (error: AppError) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: AppError | null;
  errorInfo: ErrorInfo | null;
}

export class ApplicationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error | AppError): Partial<State> {
    // Convert to AppError if it's not already
    const appError = 'type' in error 
      ? error as AppError 
      : createAppError(
          formatErrorMessage(error),
          error,
          { type: detectErrorType(error) }
        );
        
    return { 
      hasError: true, 
      error: appError 
    };
  }

  // Check if we should reset the error state when props change
  public componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError && 
      this.props.resetOnPropsChange && 
      prevProps !== this.props
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Convert to AppError if it's not already
    const appError = 'type' in error 
      ? error as AppError 
      : createAppError(
          formatErrorMessage(error),
          error,
          { type: detectErrorType(error) }
        );
    
    console.error(`Error caught in ${this.props.component || 'component'} boundary:`, error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(appError);
    }
    
    // Log to telemetry
    searchTelemetry.logEvent(TelemetryEventType.SEARCH_ERROR, {
      errorType: appError.type,
      errorMessage: appError.message,
      component: this.props.component,
      componentStack: errorInfo.componentStack
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Application Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Determine the appropriate icon based on error type
      const errorType = this.state.error?.type || ErrorType.UNKNOWN;
      
      const ErrorIcon = () => {
        switch (errorType) {
          case ErrorType.NETWORK:
            return <WifiOff className="h-12 w-12 text-red-500 mb-4" />;
          case ErrorType.TIMEOUT:
            return <Clock className="h-12 w-12 text-amber-500 mb-4" />;
          default:
            return <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />;
        }
      };
      
      // Determine appropriate title and message
      const getErrorTitle = () => {
        switch (errorType) {
          case ErrorType.NETWORK:
            return "Connection Problem";
          case ErrorType.TIMEOUT:
            return "Operation Timeout";
          case ErrorType.NOT_FOUND:
            return "Not Found";
          default:
            return "Something went wrong";
        }
      };
      
      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gray-50">
          <ErrorIcon />
          <h2 className="text-xl font-semibold mb-2">{getErrorTitle()}</h2>
          <p className="text-gray-600 mb-6 text-center max-w-lg">
            {this.state.error?.userMessage || this.state.error?.message || "We encountered an unexpected error"}
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mb-4 max-w-lg bg-red-50 p-4 rounded overflow-auto text-sm">
              <p className="font-semibold mb-2 text-red-800">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <pre className="text-xs text-red-700 mt-2 max-h-40 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
              }}
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button
              onClick={() => {
                window.location.reload();
              }}
              className="flex items-center gap-2"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
