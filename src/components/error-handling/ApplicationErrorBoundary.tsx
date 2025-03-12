import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { ErrorType, AppError, formatErrorMessage, detectErrorType } from '@/utils/errors';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ApplicationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
    
    // Call onError if provided
    if (this.props.onError) {
      this.props.onError(error);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Application Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Determine error type
    const errorType = this.detectErrorType(error);
    
    // Show toast notification if toast is available
    try {
      toast({
        title: "An error occurred",
        description: this.getUserFriendlyMessage(error, errorType),
        variant: "destructive",
      });
    } catch (e) {
      console.error("Could not show toast notification:", e);
    }
  }

  private detectErrorType(error: Error): ErrorType {
    // Use the utility function from utils/errors
    return detectErrorType(error);
  }
  
  private getUserFriendlyMessage(error: Error, errorType: ErrorType): string {
    // Check if it's our AppError type and has a userMessage
    const appError = error as Partial<AppError>;
    if (appError.userMessage) {
      return appError.userMessage;
    }
    
    // Otherwise generate a message based on the error type
    switch (errorType) {
      case ErrorType.NETWORK:
        return "We're having trouble connecting to our servers. Please check your internet connection.";
      case ErrorType.TIMEOUT:
        return "The operation took too long to complete. Please try again.";
      case ErrorType.NOT_FOUND:
        return "The requested resource was not found.";
      default:
        return formatErrorMessage(error);
    }
  }

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gray-50">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          
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
          
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
