
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostcodeSearch } from "@/components/postcode/PostcodeSearch";
import { useToast } from "@/hooks/use-toast";
import { logSearch } from "@/utils/searchLogger";
import { SearchButton } from "@/components/search/SearchButton";

interface SearchBarProps {
  onSearch?: (term: string) => void;
  variant?: "primary" | "compact";
  className?: string;
}

export const SearchBar = ({ onSearch, variant = "primary", className = "" }: SearchBarProps) => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim() || isSubmitting) {
      toast({
        title: "Error",
        description: "Please enter a valid postcode, street name or area",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Log search - using multiple column format attempts for compatibility
      await logSearch(searchTerm.trim(), 'location', 'search');
      
      // Call onSearch callback if provided
      if (onSearch) {
        onSearch(searchTerm.trim());
      }

      // Detect if input is likely a UK postcode
      const isLikelyPostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(searchTerm.trim());
      const searchType = isLikelyPostcode ? 'postcode' : 'location';
      
      // Navigate to search results with URL parameters
      navigate(`/search-results?search=${encodeURIComponent(searchTerm.trim())}&searchType=${searchType}&timestamp=${Date.now()}`);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className={variant === "compact" ? "flex items-center gap-2" : "mb-4"}>
          <PostcodeSearch
            onSelect={(value) => setSearchTerm(value)}
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
