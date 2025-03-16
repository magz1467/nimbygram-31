
import { FC, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface MapButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const MapButton: FC<MapButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="w-full text-primary flex items-center justify-center gap-1.5 mt-4"
    >
      <MapPin className="w-4 h-4" />
      See on map
    </Button>
  );
};
