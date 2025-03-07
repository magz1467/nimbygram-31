
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
      <Card className="border-t border-gray-200 shadow-lg rounded-t-xl">
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
          
          {/* Location with distance */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="h-4 w-4 mt-1 text-gray-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{selectedApp.address}</span>
              {selectedApp.distance && (
                <span className="text-xs text-gray-500">{selectedApp.distance} from search location</span>
              )}
            </div>
          </div>
          
          {/* What's the Deal section */}
          <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-100">
            <h3 className="text-lg font-semibold mb-1">
              <span className="text-[#9b87f5]">Nimbywatch</span> Analysis:
            </h3>
            <p className="text-base font-medium">What's the Deal:</p>
            <p className="text-sm text-gray-700 mt-1 mb-2">
              {selectedApp.storybook?.content?.split('The Details:')[0]?.trim() || 
                selectedApp.description?.substring(0, 120) || 
                "A planning application has been submitted for this location."}
            </p>
          </div>
          
          {expanded && (
            <div className="mt-1 space-y-3">
              {/* The Details section */}
              {selectedApp.storybook?.content?.includes('The Details:') && (
                <div>
                  <p className="text-base font-medium">The Details:</p>
                  <div className="text-sm text-gray-700 mt-1 pl-2 border-l-2 border-gray-200 space-y-1">
                    {selectedApp.storybook.content
                      .split('The Details:')[1]
                      ?.split('Considerations:')[0]
                      ?.trim()
                      .split('•')
                      .filter(Boolean)
                      .map((detail, i) => (
                        <p key={i} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{detail.trim()}</span>
                        </p>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Considerations section */}
              {selectedApp.storybook?.content?.includes('Considerations:') && (
                <div>
                  <p className="text-base font-medium">Considerations:</p>
                  <div className="text-sm text-gray-700 mt-1 pl-2 border-l-2 border-gray-200 space-y-1">
                    {selectedApp.storybook.content
                      .split('Considerations:')[1]
                      ?.trim()
                      .split('•')
                      .filter(Boolean)
                      .map((consideration, i) => (
                        <p key={i} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{consideration.trim()}</span>
                        </p>
                      ))}
                  </div>
                </div>
              )}
              
              {/* If no storybook content is structured with our keywords */}
              {!selectedApp.storybook?.content?.includes('The Details:') && (
                <div className="text-sm text-gray-700">
                  {selectedApp.description || "No detailed description available for this application."}
                </div>
              )}
              
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    selectedApp.status?.toLowerCase().includes('approved') 
                      ? 'bg-green-100 text-green-800' 
                      : selectedApp.status?.toLowerCase().includes('refused')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedApp.status || "Under Review"}
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
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show more
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
