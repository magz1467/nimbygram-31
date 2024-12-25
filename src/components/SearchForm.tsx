import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostcodeSearch } from "./PostcodeSearch";
import { useToast } from "./ui/use-toast";

export const SearchForm = () => {
  const [activeTab, setActiveTab] = useState<'recent' | 'completed'>('recent');
  const [postcode, setPostcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postcode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a postcode",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      navigate('/map', { 
        state: { 
          postcode: postcode.trim(),
          tab: activeTab,
          initialFilter: activeTab === 'completed' ? 'Approved' : undefined
        } 
      });
    } catch (error) {
      console.error('Error during search:', error);
      toast({
        title: "Error",
        description: "There was a problem with the search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
      <div className="flex gap-4 mb-6">
        <Button 
          variant="outline" 
          className={`flex-1 transition-colors ${
            activeTab === 'recent' 
              ? 'bg-primary-light text-primary hover:bg-primary hover:text-white' 
              : 'hover:bg-primary-light hover:text-primary'
          }`}
          onClick={() => setActiveTab('recent')}
          disabled={isSearching}
        >
          Recent
        </Button>
        <Button 
          variant="outline" 
          className={`flex-1 transition-colors ${
            activeTab === 'completed' 
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
              : 'hover:bg-gray-100 hover:text-gray-600'
          }`}
          onClick={() => setActiveTab('completed')}
          disabled={isSearching}
        >
          Completed
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Search location</label>
          <PostcodeSearch
            onSelect={setPostcode}
            placeholder="Enter a postcode"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary-dark text-white py-6"
          disabled={isSearching || !postcode.trim()}
        >
          {isSearching ? 'Searching...' : 'Show planning applications'}
        </Button>
      </form>
    </div>
  );
};