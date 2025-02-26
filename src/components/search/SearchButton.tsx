
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchButtonProps {
  isSubmitting: boolean;
}

export const SearchButton = ({ isSubmitting }: SearchButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-secondary hover:bg-secondary/90 text-white py-6 text-lg font-semibold rounded-xl shadow-sm"
      disabled={isSubmitting}
    >
      <Search className="w-5 h-5 mr-2" />
      {isSubmitting ? 'Loading...' : 'Show my feed'}
    </Button>
  );
};
