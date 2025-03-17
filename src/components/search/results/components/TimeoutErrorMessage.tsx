
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
     
  const isLargeAreaError = error && error.message.includes('large area');
  const isOutcodeError = error && error.message.includes('Invalid outcode');

  const locationTerm = displayTerm || searchTerm || postcode || 'this location';

  let title = "Error loading results";
  let message = error ? error.message : `We couldn't find any planning applications for ${locationTerm}. Please try another search.`;
  
  if (isTimeoutError) {
    title = isLargeAreaError ? "Large Area Search" : "Search Timeout";
    message = `The search for "${locationTerm}" covers a large area. For better results, try:
    • Using a specific postcode
    • Searching for a street name
    • Using a smaller area within ${locationTerm}`;
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
