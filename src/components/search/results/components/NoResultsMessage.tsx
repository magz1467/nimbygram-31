
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search } from "lucide-react";

interface NoResultsMessageProps {
  searchTerm?: string;
  displayTerm?: string;
  postcode?: string;
  onRetry?: () => void;
  isStillSearching?: boolean;
}

export const NoResultsMessage = ({
  searchTerm,
  displayTerm,
  postcode,
  onRetry,
  isStillSearching = false
}: NoResultsMessageProps) => {
  const locationTerm = displayTerm || searchTerm || postcode || 'this location';
  
  if (isStillSearching) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center mb-3">
          <Search className="text-primary h-10 w-10 animate-pulse" />
        </div>
        <h3 className="text-xl font-medium mb-3">Searching for applications...</h3>
        <p className="text-gray-600 mb-4">
          We're still looking for planning applications in {locationTerm}.
        </p>
        <div className="flex items-center justify-center space-x-2 mt-6">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "600ms" }}></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 text-center">
      <div className="flex justify-center mb-3">
        <AlertTriangle className="text-primary h-10 w-10" />
      </div>
      <h3 className="text-xl font-medium mb-3">No planning applications found</h3>
      <p className="text-gray-600 mb-4">
        We searched thoroughly but couldn't find any planning applications for {locationTerm}.
      </p>
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-gray-600 text-sm border-t border-b border-gray-100 py-3">
          This could be because:
          <ul className="mt-2 text-left list-disc pl-5">
            <li>There are no applications in this specific area</li>
            <li>The search radius might be too small</li>
            <li>Applications might be available but not yet in our database</li>
          </ul>
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="px-6 py-2 rounded bg-primary text-white hover:bg-primary/90"
          >
            Try Again with a Larger Radius
          </Button>
        )}
      </div>
    </div>
  );
};
