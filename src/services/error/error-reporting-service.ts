
import { supabase } from "@/integrations/supabase/client";
import { ErrorType, AppError, formatErrorMessage } from "@/utils/errors";

/**
 * A centralized service for error reporting, analytics, and monitoring
 */
class ErrorReportingService {
  private isEnabled: boolean = true;
  private errorCount: Record<string, number> = {};
  
  constructor() {
    // Reset error count every hour to prevent flooding
    setInterval(() => {
      this.errorCount = {};
    }, 60 * 60 * 1000);
  }
  
  public disable(): void {
    this.isEnabled = false;
  }
  
  public enable(): void {
    this.isEnabled = true;
  }
  
  /**
   * Report an error to the centralized reporting system
   * Includes rate limiting to prevent flooding
   */
  public reportError(
    error: Error | AppError | unknown,
    context: Record<string, any> = {}
  ): void {
    if (!this.isEnabled) {
      return;
    }
    
    const formattedError = this.formatError(error);
    const errorKey = this.getErrorKey(formattedError);
    
    // Rate limiting to prevent flooding
    if (this.isRateLimited(errorKey)) {
      return;
    }
    
    // Log to console for development
    console.error('🔴 Error reported:', formattedError, context);
    
    // In production, we would send to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to Supabase for logging
      this.logToSupabase(formattedError, context);
      
      // Here we would integrate with Sentry, LogRocket, etc.
    }
  }
  
  private formatError(error: Error | AppError | unknown): {
    message: string;
    type: ErrorType;
    stack?: string;
  } {
    if (!error) {
      return {
        message: 'Unknown error',
        type: ErrorType.UNKNOWN
      };
    }
    
    // If it's an AppError, use its properties
    if (typeof error === 'object' && 'type' in error) {
      const appError = error as AppError;
      return {
        message: appError.message,
        type: appError.type,
        stack: appError.stack
      };
    }
    
    // If it's a standard Error
    if (error instanceof Error) {
      return {
        message: error.message,
        type: this.detectErrorType(error),
        stack: error.stack
      };
    }
    
    // For anything else, convert to string
    return {
      message: formatErrorMessage(error),
      type: ErrorType.UNKNOWN
    };
  }
  
  private detectErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || !navigator.onLine) {
      return ErrorType.NETWORK;
    } else if (message.includes('timeout')) {
      return ErrorType.TIMEOUT;
    } else if (message.includes('not found')) {
      return ErrorType.NOT_FOUND;
    }
    
    return ErrorType.UNKNOWN;
  }
  
  private getErrorKey(error: { message: string; type: ErrorType }): string {
    return `${error.type}:${error.message.substring(0, 100)}`;
  }
  
  private isRateLimited(errorKey: string): boolean {
    // Initialize count if not exists
    if (!this.errorCount[errorKey]) {
      this.errorCount[errorKey] = 0;
    }
    
    // Increment count
    this.errorCount[errorKey]++;
    
    // Rate limit to max 5 of the same error per hour
    return this.errorCount[errorKey] > 5;
  }
  
  private logToSupabase(
    error: { message: string; type: ErrorType; stack?: string },
    context: Record<string, any>
  ): void {
    supabase
      .from('error_logs')
      .insert({
        error_message: error.message,
        error_type: error.type,
        error_stack: error.stack,
        context: context,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
      .then((result) => {
        if (result.error) {
          console.error('Failed to log error to Supabase:', result.error);
        }
      })
      .catch((err) => {
        console.error('Failed to log error to Supabase:', err);
      });
  }
}

// Export singleton instance
export const errorReporting = new ErrorReportingService();
