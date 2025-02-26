
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface CardFooterProps {
  onSeeOnMap: () => void;
}

export const CardFooter = ({ onSeeOnMap }: CardFooterProps) => {
  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onSeeOnMap}
        className="text-primary"
      >
        <MapPin className="w-4 h-4 mr-2" />
        See on map
      </Button>
    </div>
  );
};

