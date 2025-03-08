
import { Application } from "@/types/planning";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface SearchResultCardProps {
  application: Application;
  onSeeOnMap?: (id: number) => void;
}

export const SearchResultCard = ({ 
  application,
  onSeeOnMap
}: SearchResultCardProps) => {
  // Handler for See on Map button
  const handleSeeOnMap = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default to avoid page scrolling
    
    if (onSeeOnMap) {
      onSeeOnMap(application.id);
    }
  };

  return (
    <div className="rounded-lg bg-white shadow-sm border p-4" id={`application-${application.id}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">{application.title}</h3>
          {onSeeOnMap && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleSeeOnMap}
            >
              <MapPin className="h-4 w-4" />
              <span>See on Map</span>
            </Button>
          )}
        </div>
        
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative">
          {application.streetview_url ? (
            <img 
              src={application.streetview_url} 
              alt={application.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-gray-600 mb-2">{application.address}</p>
          <p className="text-sm text-gray-500">{application.description}</p>
        </div>
      </div>
    </div>
  );
};
