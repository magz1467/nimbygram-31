
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
     
  const isOutcodeError = error && error.message.includes('Invalid outcode');

  const locationTerm = displayTerm || searchTerm || postcode || 'this location';

  // Determine appropriate error title and message
  let title = "Error loading results";
  let message = error ? error.message : `We couldn't find any planning applications for ${locationTerm}. Please try another search.`;
  
  if (isTimeoutError) {
    title = "Search Timeout";
    message = `The search for "${locationTerm}" is taking longer than expected. We've loaded some results, but there may be more. You can try a more specific location or different filters.`;
  } else if (isOutcodeError) {
    title = "Partial Postcode Error";
    message = `"${locationTerm}" appears to be a partial postcode. Please try using a full postcode (e.g., SW1A 1AA) or a more specific location name.`;
  }

  return (
    <ErrorMessage 
      title={title}
      message={message}
      onRetry={onRetry}
    />
  );
};
