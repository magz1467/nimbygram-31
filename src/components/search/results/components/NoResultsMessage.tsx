
import { Button } from "@/components/ui/button";

interface NoResultsMessageProps {
  searchTerm?: string;
  displayTerm?: string;
  postcode?: string;
  onRetry?: () => void;
}

export const NoResultsMessage = ({
  searchTerm,
  displayTerm,
  postcode,
  onRetry
}: NoResultsMessageProps) => {
  const locationTerm = displayTerm || searchTerm || postcode || 'this location';
  
  return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-medium mb-2">No results found</h3>
      <p className="text-gray-600 mb-6">
        We couldn't find any planning applications for {locationTerm}.
      </p>
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
