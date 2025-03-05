
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostcodeSearch } from "@/components/PostcodeSearch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationSearch } from "@/components/search/LocationSearch";
import { SearchButton } from "@/components/search/SearchButton";
import { logSearch } from "@/utils/searchLogger";

interface SearchFormProps {
  activeTab?: string;
  onSearch?: (postcode: string) => void;
}

export const SearchForm = ({ activeTab, onSearch }: SearchFormProps) => {
  const [postcode, setPostcode] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchType, setSearchType] = useState<'postcode' | 'location'>(activeTab as 'postcode' | 'location' || 'postcode');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLocationChange = (value: string) => {
    console.log('📍 Location input changed:', value);
    setLocation(value);
  };

  const handleLocationSelect = (selectedLocation: string) => {
    if (!selectedLocation) {
      console.warn('No location selected');
      return;
    }
    setLocation(selectedLocation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchTerm = searchType === 'postcode' ? postcode.trim() : location.trim();
    
    if (!searchTerm || isSubmitting) {
      toast({
        title: "Error",
        description: "Please enter a valid search term",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log(`🔄 Starting search for ${searchType}:`, searchTerm);

    try {
      // Log search first
      await logSearch(searchTerm, searchType, activeTab);
      
      // Clear any existing search state from session storage
      sessionStorage.removeItem('lastSearchLocation');
      
      // Clear query cache
      const cacheKeys = Object.keys(sessionStorage).filter(key => 
        key.startsWith('tanstack-query-')
      );
      
      cacheKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Call onSearch callback for postcode searches if provided
      if (onSearch && searchType === 'postcode') {
        onSearch(searchTerm);
      }

      // Navigate to search results with state
      navigate('/search-results', {
        state: {
          searchType,
          searchTerm,
          timestamp: Date.now() // Add timestamp to ensure state changes are detected
        },
        replace: true // Use replace to prevent back button issues
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
      <Tabs 
        defaultValue={searchType}
        value={searchType}
        className="w-full" 
        onValueChange={(value) => setSearchType(value as 'postcode' | 'location')}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-background">
          <TabsTrigger value="postcode" className="data-[state=active]:bg-white">
            Search by Postcode
          </TabsTrigger>
          <TabsTrigger value="location" className="data-[state=active]:bg-white">
            Search by Location
          </TabsTrigger>
        </TabsList>
        <TabsContent value="postcode" className="mt-0">
          <PostcodeSearch
            onSelect={(value) => {
              console.log('📮 Postcode selected:', value);
              setPostcode(value);
            }}
            placeholder="Enter postcode"
            className="flex-1"
          />
        </TabsContent>
        <TabsContent value="location" className="mt-0">
          <LocationSearch
            location={location}
            onLocationChange={handleLocationChange}
            onLocationSelect={handleLocationSelect}
          />
        </TabsContent>
      </Tabs>
      <SearchButton isSubmitting={isSubmitting} />
    </form>
  );
};
