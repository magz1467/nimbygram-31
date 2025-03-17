
import { ErrorMessage } from "./ErrorMessage";

interface TimeoutErrorMessageProps {
  error: Error | null;
  searchTerm?: string;
  displayTerm?: string;
  postcode?: string;
  onRetry?: () => void;
}

export const TimeoutErrorMessage = ({
  error,
  searchTerm,
  displayTerm,
  postcode,
  onRetry
}: TimeoutErrorMessageProps) => {
  const isTimeoutError = error && 
    (error.message.includes('timeout') || 
     error.message.includes('57014') || 
     error.message.includes('canceling statement') ||
     error.message.includes('cancel'));

  const locationTerm = displayTerm || searchTerm || postcode || 'this location';

  return (
    <ErrorMessage 
      title={isTimeoutError ? "Search Timeout" : (error ? "Error loading results" : "No results found")}
      message={
        isTimeoutError ? 
          `The search for "${locationTerm}" is taking longer than expected. We've loaded some results, but there may be more. You can try a more specific location or different filters.` :
          (error ? error.message : `We couldn't find any planning applications for ${locationTerm}. Please try another search.`)
      }
      onRetry={onRetry}
    />
  );
};
