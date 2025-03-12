
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostcodeSearch } from "@/components/PostcodeSearch";
import { useToast } from "@/hooks/use-toast";
import { logSearch } from "@/utils/searchLogger";
import { SearchButton } from "@/components/search/SearchButton";

export const SearchForm = ({ activeTab, onSearch }) => {
  const [postcode, setPostcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!postcode.trim() || isSubmitting) {
      toast({
        title: "Error",
        description: "Please enter a valid postcode, street name or area",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Log search
      logSearch(postcode.trim(), 'location', activeTab);
      
      // Call onSearch callback if provided
      if (onSearch) {
        onSearch(postcode.trim());
      }

      // Navigate to search results
      navigate('/search-results', {
        state: {
          searchType: 'location',
          searchTerm: postcode.trim(),
          displayTerm: postcode.trim(),
          timestamp: Date.now()
        }
      });
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
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <PostcodeSearch
            onSelect={(value) => setPostcode(value)}
            placeholder="Search by postcode, street name or area"
            className="flex-1"
          />
        </div>
        <SearchButton 
          isSubmitting={isSubmitting} 
          onClick={() => handleSubmit(null)} 
        />
      </form>
    </div>
  );
};
