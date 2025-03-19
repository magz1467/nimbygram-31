
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostcodeSearch } from "@/components/postcode/PostcodeSearch";
import { useToast } from "@/hooks/use-toast";
import { logSearch } from "@/utils/searchLogger";
import { SearchButton } from "@/components/search/SearchButton";
import { getCurrentHostname, getEnvironmentName } from "@/utils/environment";

interface SearchBarProps {
  onSearch?: (term: string, isLocationName?: boolean) => void;
  variant?: "primary" | "compact";
  className?: string;
}

export const SearchBar = ({ onSearch, variant = "primary", className = "" }: SearchBarProps) => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isLocationName, setIsLocationName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const env = getEnvironmentName();
  const hostname = getCurrentHostname();

  const handleSubmit = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    
    console.log(`[SearchBar][${env}][${hostname}] 🔍 Search submitted: "${searchTerm}", isLocationName: ${isLocationName}`);
    
    if (!searchTerm.trim() || isSubmitting) {
      console.log(`[SearchBar][${env}] ⚠️ Invalid search term or already submitting`);
      toast({
        title: "Error",
        description: "Please enter a valid postcode, street name or area",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log(`[SearchBar][${env}] 🔍 Starting search for: "${searchTerm.trim()}"`);
    
    try {
      // Log search
      console.log(`[SearchBar][${env}] Calling logSearch for: "${searchTerm.trim()}"`);
      await logSearch(searchTerm.trim(), 'search');
      console.log(`[SearchBar][${env}] logSearch completed`);
      
      // Call onSearch callback if provided
      if (onSearch) {
        console.log(`[SearchBar][${env}] Calling onSearch callback`);
        onSearch(searchTerm.trim(), isLocationName);
      }

      // Detect if input is likely a UK postcode or if it's explicitly marked as a location
      const isLikelyPostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(searchTerm.trim());
      const searchType = isLikelyPostcode ? 'postcode' : isLocationName ? 'location' : 'location';
      
      console.log(`[SearchBar][${env}] Navigating to search results with: "${searchTerm.trim()}", type: ${searchType}`);
      
      // UPDATED: Ensure consistent URL parameter format with Header.tsx
      const timestamp = Date.now();
      const url = `/search-results?search=${encodeURIComponent(searchTerm.trim())}&searchType=${searchType}&timestamp=${timestamp}&isLocationName=${isLocationName}`;
      console.log(`[SearchBar][${env}] Navigation URL: ${url}`);
      
      // Use replace to avoid history stacking, and pass state to ensure consistency
      navigate(url, { 
        replace: true,
        state: {
          searchTerm: searchTerm.trim(),
          searchType,
          isLocationName,
          timestamp
        }
      });
      
      console.log(`[SearchBar][${env}] ✅ Navigation initiated to ${url}`);
    } catch (error) {
      console.error(`[SearchBar][${env}] 🔴 Search error:`, error);
      toast({
        title: "Error",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset isSubmitting after a delay to prevent multiple submissions
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  const handlePostcodeSelect = (value: string, locationFlag = false) => {
    setSearchTerm(value);
    setIsLocationName(locationFlag);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className={variant === "compact" ? "flex items-center gap-2" : "mb-4"}>
          <PostcodeSearch
            onSelect={handlePostcodeSelect}
            placeholder="Search by postcode, street name or area"
            className="flex-1"
            initialValue={searchTerm}
          />
          
          {variant === "compact" ? (
            <SearchButton 
              isSubmitting={isSubmitting} 
              onClick={() => handleSubmit(null)}
              variant="compact" 
            />
          ) : (
            <div className="mt-3">
              <SearchButton 
                isSubmitting={isSubmitting} 
                onClick={() => handleSubmit(null)} 
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
