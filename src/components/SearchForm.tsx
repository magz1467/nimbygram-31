import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { PostcodeSearch } from "@/components/PostcodeSearch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface SearchFormProps {
  activeTab?: string;
  onSearch?: (postcode: string) => void;
}

export const SearchForm = ({ activeTab, onSearch }: SearchFormProps) => {
  const [postcode, setPostcode] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchType, setSearchType] = useState<'postcode' | 'location'>('postcode');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: locationSuggestions = [], isLoading: isLoadingLocations } = useAddressSuggestions(location);

  const logSearch = async (searchTerm: string, type: 'postcode' | 'location') => {
    try {
      console.log('🔍 Logging search:', {
        searchTerm,
        type,
        status: activeTab,
        timestamp: new Date().toISOString()
      });

      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from('Searches').insert({
        'Post Code': type === 'postcode' ? searchTerm : null,
        'Location': type === 'location' ? searchTerm : null,
        'Status': activeTab,
        'User_logged_in': !!session?.user
      });

      if (error) {
        console.error('Error logging search:', error);
        toast({
          title: "Analytics Error",
          description: "Your search was processed but we couldn't log it. This won't affect your results.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error logging search:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchTerm = searchType === 'postcode' ? postcode.trim() : location.trim();
    
    if (!searchTerm || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    console.log(`🔄 Search started for ${searchType}:`, searchTerm);

    try {
      console.log('📝 Before logging search');
      await logSearch(searchTerm, searchType);
      console.log('✅ After logging search');
      
      if (onSearch && searchType === 'postcode') {
        onSearch(searchTerm);
      }

      // Dispatch events first
      console.log('🔔 Dispatching searchStarted event');
      window.dispatchEvent(new CustomEvent('searchStarted'));
      
      console.log('📨 Dispatching search event:', { type: searchType, term: searchTerm });
      window.dispatchEvent(new CustomEvent('postcodeSearch', {
        detail: { 
          postcode: searchType === 'postcode' ? searchTerm : null,
          location: searchType === 'location' ? searchTerm : null
        }
      }));

      // Navigate to search-results
      console.log('🚀 Navigating to search-results with search term:', searchTerm);
      navigate('/search-results', { 
        state: { 
          postcode: searchType === 'postcode' ? searchTerm : null,
          location: searchType === 'location' ? searchTerm : null
        },
        replace: true
      });

    } catch (error) {
      console.error('❌ Error during search:', error);
      toast({
        title: "Error",
        description: "There was a problem processing your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowLocationSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Tabs defaultValue="postcode" className="w-full" onValueChange={(value) => setSearchType(value as 'postcode' | 'location')}>
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-background">
          <TabsTrigger value="postcode" className="data-[state=active]:bg-white">Search by Postcode</TabsTrigger>
          <TabsTrigger value="location" className="data-[state=active]:bg-white">Search by Location</TabsTrigger>
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
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Enter location (e.g., street, town, or city)"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(e.target.value.length >= 2);
              }}
              onFocus={() => location.length >= 2 && setShowLocationSuggestions(true)}
              className="w-full pl-4 pr-10 py-2 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {showLocationSuggestions && location.length >= 2 && (
              <div className="absolute z-[9999] w-full mt-1">
                <Command className="rounded-lg border shadow-md bg-white">
                  <CommandList>
                    {isLoadingLocations ? (
                      <CommandEmpty>Loading suggestions...</CommandEmpty>
                    ) : locationSuggestions.length === 0 ? (
                      <CommandEmpty>No results found.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {locationSuggestions.map((suggestion) => (
                          <CommandItem
                            key={suggestion.postcode}
                            onSelect={() => handleLocationSelect(suggestion.address || suggestion.postcode)}
                            className="hover:bg-primary/10"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{suggestion.address || suggestion.postcode}</span>
                              <span className="text-sm text-gray-500">
                                {suggestion.admin_district}, {suggestion.country}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Button 
        type="submit" 
        className="w-full bg-secondary hover:bg-secondary/90 text-white py-6 text-lg font-semibold rounded-xl shadow-sm"
        disabled={isSubmitting}
      >
        <Search className="w-5 h-5 mr-2" />
        {isSubmitting ? 'Loading...' : 'Show my feed'}
      </Button>
    </form>
  );
};
