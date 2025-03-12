
import { Button } from "@/components/ui/button";

interface WendoverAlternativesProps {
  onSelect: (location: string) => void;
}

export const WendoverAlternatives = ({ onSelect }: WendoverAlternativesProps) => {
  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-medium text-sm text-gray-600">Try these alternatives:</h4>
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onSelect("Wendover High Street")}
        >
          Wendover High Street
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onSelect("Halton Village")}
        >
          Halton Village
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onSelect("Stoke Mandeville")}
        >
          Stoke Mandeville
        </Button>
      </div>
    </div>
  );
};
