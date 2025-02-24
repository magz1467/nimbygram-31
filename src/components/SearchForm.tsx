
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
      console.log('🔍 Logging search:', {
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
    console.log('🔄 Search started for postcode:', postcode);

    const trimmedPostcode = postcode.trim();

    try {
      console.log('📝 Before logging search');
      await logSearch(trimmedPostcode);
      console.log('✅ After logging search');
      
      if (onSearch) {
        onSearch(trimmedPostcode);
      }

      // Dispatch events first
      console.log('🔔 Dispatching searchStarted event');
      window.dispatchEvent(new CustomEvent('searchStarted'));
      
      console.log('📨 Dispatching postcodeSearch event:', trimmedPostcode);
      window.dispatchEvent(new CustomEvent('postcodeSearch', {
        detail: { postcode: trimmedPostcode }
      }));

      // Then navigate
      console.log('🚀 Navigating to map with postcode:', trimmedPostcode);
      navigate('/map', { 
        state: { postcode: trimmedPostcode },
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <PostcodeSearch
        onSelect={(value) => {
          console.log('📮 Postcode selected:', value);
          setPostcode(value);
        }}
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
