
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PostcodeSearch } from "@/components/PostcodeSearch";
import { useToast } from "@/hooks/use-toast";
import { logSearch } from "@/utils/searchLogger";
import { SearchButton } from "@/components/search/SearchButton";

interface SearchFormProps {
  activeTab?: string;
  onSearch?: (postcode: string) => void;
}

export const SearchForm = ({ activeTab, onSearch }: SearchFormProps) => {
  const [postcode, setPostcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchTerm = postcode.trim();
    
    if (!searchTerm || isSubmitting) {
      toast({
        title: "Error",
        description: "Please enter a valid postcode",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log(`🔄 Starting search for postcode:`, searchTerm);

    try {
      // Log search but don't wait for it to complete - this was causing issues
      logSearch(searchTerm, 'postcode', activeTab).catch(logError => {
        console.error('Error logging search:', logError);
        // Continue with search even if logging fails
      });
      
      // Clear any existing search state from session storage
      sessionStorage.removeItem('lastSearchLocation');
      
      // Clear query cache for fresh search results
      const cacheKeys = Object.keys(sessionStorage).filter(key => 
        key.startsWith('tanstack-query-')
      );
      
      cacheKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Call onSearch callback for postcode searches if provided
      if (onSearch) {
        console.log('📍 Calling onSearch callback with postcode:', searchTerm);
        onSearch(searchTerm);
      }

      console.log('🧭 Navigating to search results with state:', {
        searchType: 'postcode',
        searchTerm,
        timestamp: Date.now()
      });

      // Navigate to search results with state
      // Use replace: false to preserve navigation history
      navigate('/search-results', {
        state: {
          searchType: 'postcode',
          searchTerm,
          timestamp: Date.now() // Add timestamp to ensure state changes are detected
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="mb-4">
        <PostcodeSearch
          onSelect={(value) => {
            console.log('📮 Postcode selected:', value);
            setPostcode(value);
          }}
          placeholder="Enter postcode"
          className="flex-1"
        />
      </div>
      <SearchButton isSubmitting={isSubmitting} />
    </form>
  );
};
