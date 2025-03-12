
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PostcodeSearch } from "@/components/PostcodeSearch";
import { useToast } from "@/hooks/use-toast";
import { logSearch } from "@/utils/searchLogger";
import { SearchButton } from "@/components/search/SearchButton";
import { getCachedCoordinates } from "@/services/coordinates/coordinates-cache";

interface SearchFormProps {
  activeTab?: string;
  onSearch?: (postcode: string) => void;
}

export const SearchForm = ({ activeTab, onSearch }: SearchFormProps) => {
  const [postcode, setPostcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Prevent default form submission behavior
    
    const searchTerm = postcode.trim();
    
    if (!searchTerm || isSubmitting) {
      toast({
        title: "Error",
        description: "Please enter a valid postcode, street name or area",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log(`🔄 Starting search for location:`, searchTerm);

    try {
      // Log search but don't wait for it to complete
      logSearch(searchTerm, 'location', activeTab).catch(logError => {
        console.error('Error logging search:', logError);
        // Continue with search even if logging fails
      });
      
      // Extract a readable name from the search term
      const displayTerm = searchTerm.startsWith('ChIJ') && searchTerm.includes(',')
        ? searchTerm.split(',')[0].trim()
        : searchTerm;
      
      // Call onSearch callback if provided
      if (onSearch) {
        console.log('📍 Calling onSearch callback with location:', searchTerm);
        onSearch(searchTerm);
      }

      // Check if we already have coordinates for this location in cache
      const cachedCoordinates = getCachedCoordinates(searchTerm);
      
      console.log('🧭 Navigating to search results with state:', {
        searchType: 'location',
        searchTerm,
        displayTerm,
        timestamp: Date.now(),
        cachedCoordinates: cachedCoordinates ? 'available' : 'not available'
      });

      // Use React Router navigation to prevent full page reloads
      navigate('/search-results', {
        state: {
          searchType: 'location',
          searchTerm,
          displayTerm,
          timestamp: Date.now(),
          // Include cached coordinates if available to skip geocoding step
          ...(cachedCoordinates && { coordinates: cachedCoordinates })
        },
        replace: false
      });

    } catch (error) {
      console.error('❌ Search error:', error);
      toast({
        title: "Error",
        description: "There was a problem processing your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <PostcodeSearch
            onSelect={(value) => {
              console.log('📮 Location selected:', value);
              setPostcode(value);
            }}
            placeholder="Search by postcode, street name or area"
            className="flex-1"
          />
        </div>
        <SearchButton isSubmitting={isSubmitting} onClick={handleSubmit} />
      </form>
    </div>
  );
};
