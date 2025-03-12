
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorType } from "@/utils/errors";
import { formatErrorMessage } from "@/utils/errors";
import { ErrorIcon } from "./error-view/ErrorIcon";
import { ErrorTitle } from "./error-view/ErrorTitle";
import { ErrorSuggestions } from "./error-view/ErrorSuggestions";
import { ErrorActions } from "./error-view/ErrorActions";
import { WendoverAlternatives } from "./error-view/WendoverAlternatives";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchErrorViewProps {
  errorDetails: string | null;
  errorType?: ErrorType;
  onRetry: () => void;
}

export const SearchErrorView = ({ 
  errorDetails, 
  errorType = ErrorType.UNKNOWN,
  onRetry 
}: SearchErrorViewProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  
  const formattedErrorDetails = formatErrorMessage(errorDetails || "Unknown error");
  const isWendoverPostcode = formattedErrorDetails?.toLowerCase().includes('hp22 6jj') || 
    formattedErrorDetails?.toLowerCase().includes('wendover');
  
  const isLocationTimeout = errorType === ErrorType.TIMEOUT && 
    (formattedErrorDetails?.includes('Amersham') || 
     formattedErrorDetails?.includes('reduced area') ||
     formattedErrorDetails?.includes('search area') ||
     isWendoverPostcode);

  const getSuggestions = () => {
    if (isWendoverPostcode) {
      return [
        "Try searching for a specific street in Wendover",
        "Use 'Wendover High Street' or another landmark instead",
        "Try searching for 'Halton' or another nearby village",
        "Try a smaller search radius (3km or less) once you search again"
      ];
    }
    
    switch (errorType) {
      case ErrorType.TIMEOUT:
        return isLocationTimeout ? [
          "Try searching for a specific street in this area",
          "Add a street name or landmark to your search",
          "Use a full postcode instead of just the area name",
          "Try a smaller search radius once you search again"
        ] : [
          "Use a more specific location",
          "Try adding filters like application status or type",
          "Search for a smaller area or specific street name"
        ];
      case ErrorType.NOT_FOUND:
        return [
          "Check if you typed the location correctly",
          "Try a nearby location",
          "Expand your search by using a more general area name"
        ];
      default:
        return [
          "Try a different search term",
          "Check your spelling",
          "Try again later"
        ];
    }
  };

  const handleWendoverAlternativeSearch = (alternativeLocation: string) => {
    navigate('/search-results', {
      state: {
        searchType: 'location',
        searchTerm: alternativeLocation,
        displayTerm: alternativeLocation,
        timestamp: Date.now()
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="mb-4">
          <ErrorIcon errorType={errorType} isLocationTimeout={isLocationTimeout} />
        </div>
        
        <ErrorTitle errorType={errorType} isWendoverPostcode={isWendoverPostcode} />
        
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {formattedErrorDetails}
        </p>
        
        <ErrorSuggestions suggestions={getSuggestions()} />
        
        {isWendoverPostcode && (
          <WendoverAlternatives onSelect={handleWendoverAlternativeSearch} />
        )}
        
        {formattedErrorDetails && (
          <div className="mb-6 w-full max-w-md">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 mb-2"
            >
              <Info size={16} />
              {showDetails ? "Hide Technical Details" : "Show Technical Details"}
            </Button>
            
            {showDetails && (
              <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                {formattedErrorDetails}
              </div>
            )}
          </div>
        )}
        
        <ErrorActions onRetry={onRetry} />
      </div>
    </div>
  );
};
