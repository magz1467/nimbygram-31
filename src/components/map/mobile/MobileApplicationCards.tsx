
import { Application } from "@/types/planning";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";

interface MobileApplicationCardsProps {
  applications: Application[];
  selectedId: number | null;
  onSelectApplication: (id: number) => void;
  postcode: string;
}

export const MobileApplicationCards = ({
  applications,
  selectedId,
  onSelectApplication,
  postcode,
}: MobileApplicationCardsProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    if (selectedId && applications.length > 0) {
      const app = applications.find(a => a.id === selectedId);
      if (app) {
        setSelectedApp(app);
      }
    }
  }, [selectedId, applications]);

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  if (!selectedApp) return null;

  return (
    <div className="mobile-application-cards">
      <Card className="border-0 shadow-none">
        <div className="p-4 flex flex-col">
          <div className="flex justify-center mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-1 rounded-full bg-gray-300 p-0 hover:bg-gray-400"
              onClick={toggleExpanded}
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              <span className="sr-only">
                {expanded ? "Collapse details" : "Expand details"}
              </span>
            </Button>
          </div>
          
          <h3 className="text-lg font-medium line-clamp-2">
            {selectedApp.title || "Planning Application"}
          </h3>
          
          <p className="text-sm text-gray-500 mt-1">
            {selectedApp.address}
          </p>
          
          {/* Display distance if available */}
          {selectedApp.distance && (
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-primary" />
              {selectedApp.distance} from search location
            </p>
          )}
          
          {expanded && (
            <div className="mt-4">
              <p className="text-sm">
                {selectedApp.description?.substring(0, 150) || "No description available"}
                {selectedApp.description && selectedApp.description.length > 150 ? "..." : ""}
              </p>
              
              <div className="mt-4 flex gap-3">
                <div className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    selectedApp.status?.toLowerCase().includes('approved') 
                      ? 'bg-green-100 text-green-800' 
                      : selectedApp.status?.toLowerCase().includes('refused')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedApp.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-right">
            <Button 
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="text-primary"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Less details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  More details
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
