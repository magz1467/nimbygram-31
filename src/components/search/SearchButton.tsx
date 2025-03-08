
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SearchButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
}

export const SearchButton = ({ isSubmitting, onClick }: SearchButtonProps) => {
  return (
    <Button
      type="button"
      className="w-full"
      disabled={isSubmitting}
      onClick={onClick}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        "Search"
      )}
    </Button>
  );
};
