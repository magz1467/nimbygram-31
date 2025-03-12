
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface SeeOnMapButtonProps {
  onClick: () => void;
}

export const SeeOnMapButton = ({ onClick }: SeeOnMapButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-primary flex items-center gap-1.5"
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent's onClick
        onClick();
      }}
    >
      <MapPin className="h-4 w-4" />
      <span>See on Map</span>
    </Button>
  );
};
