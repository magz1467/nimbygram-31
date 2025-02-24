
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { PostcodeSearch } from "@/components/PostcodeSearch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchFormProps {
  activeTab?: string;
  onSearch?: (postcode: string) => void;
}

export const SearchForm = ({ activeTab, onSearch }: SearchFormProps) => {
  const [postcode, setPostcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const logSearch = async (postcode: string) => {
    try {
      console.log('Logging search from SearchForm:', {
        postcode,
        status: activeTab,
        timestamp: new Date().toISOString()
      });

      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from('Searches').insert({
        'Post Code': postcode,
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
      } else {
        console.log('Search logged successfully from SearchForm');
      }
    } catch (error) {
      console.error('Error logging search:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postcode.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    console.log('Search started, setting loading state...');

    const trimmedPostcode = postcode.trim();

    try {
      // Log the search first
      await logSearch(trimmedPostcode);
      
      if (onSearch) {
        onSearch(trimmedPostcode);
      }

      // Navigate to map page with loading state
      navigate('/map', { 
        state: { postcode: trimmedPostcode },
        replace: true
      });

      // Then dispatch the search events after navigation
      window.dispatchEvent(new CustomEvent('searchStarted'));
      window.dispatchEvent(new CustomEvent('postcodeSearch', {
        detail: { postcode: trimmedPostcode }
      }));
      console.log('Dispatched search events');

    } catch (error) {
      console.error('Error during search:', error);
      toast({
        title: "Error",
        description: "There was a problem processing your search. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <PostcodeSearch
        onSelect={setPostcode}
        placeholder="Enter postcode"
        className="flex-1"
      />
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

