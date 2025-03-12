
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

interface SearchButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
  variant?: "default" | "compact";
}

export const SearchButton = ({ 
  isSubmitting, 
  onClick,
  variant = "default" 
}: SearchButtonProps) => {
  if (variant === "compact") {
    return (
      <Button 
        onClick={onClick} 
        disabled={isSubmitting} 
        size="sm"
        className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span>Search</span>
      </Button>
    );
  }
  
  return (
    <Button 
      onClick={onClick} 
      disabled={isSubmitting} 
      className="w-full bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
    >
      {isSubmitting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Search className="h-5 w-5" />
      )}
      <span>Search</span>
    </Button>
  );
};
