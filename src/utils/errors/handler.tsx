
import { toast } from "@/hooks/use-toast";
import { AppError, ErrorType } from "./types";
import { formatErrorMessage } from "./formatting";

/**
 * Handles error display in the UI
 */
export function handleUIError(error: unknown, options?: { showToast?: boolean }) {
  const { showToast = true } = options || {};
  
  if (!error) return;
  
  const message = formatErrorMessage(error);
  const type = error instanceof AppError ? error.type : ErrorType.UNKNOWN;
  
  // Log error to console
  console.error('UI Error:', message, { type });
  
  // Show toast for user feedback
  if (showToast) {
    toast({
      title: type === ErrorType.TIMEOUT ? "Operation Timeout" : "Error",
      description: message,
      variant: "destructive",
    });
  }
  
  return { message, type };
}
