
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface CardContentProps {
  storybook?: string | null;
  onSeeOnMap?: () => void;
}

export const CardContent = ({ storybook, onSeeOnMap }: CardContentProps) => {
  const handleSeeOnMap = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event propagation
    console.log('💡 See on map button clicked');
    if (onSeeOnMap) {
      onSeeOnMap();
    }
  };

  return (
    <div className="space-y-4">
      {storybook && (
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
          {storybook}
        </p>
      )}
      
      {onSeeOnMap && (
        <Button 
          onClick={handleSeeOnMap}
          className="w-full flex items-center justify-center gap-2 mt-2"
          variant="outline"
        >
          <MapPin className="h-4 w-4" />
          See on Map
        </Button>
      )}
    </div>
  );
};
