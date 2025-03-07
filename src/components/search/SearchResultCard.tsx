
import { Application } from "@/types/planning";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Calendar } from "lucide-react";
import { formatStorybook } from "@/utils/storybook-formatter";
import { ApplicationBadges } from "../applications/ApplicationBadges";
import { format } from "date-fns";

interface SearchResultCardProps {
  application: Application;
  onSeeOnMap?: (id: number) => void;
}

export const SearchResultCard = ({ application, onSeeOnMap }: SearchResultCardProps) => {
  const { id, title, description, address, postcode, status, last_date_consultation_comments, storybook, distance, received_date, received } = application;
  
  const formattedStorybook = formatStorybook(storybook);
  
  // Format the received date
  const displayDate = received_date || received;
  const formattedDate = displayDate ? format(new Date(displayDate), 'dd MMM yyyy') : null;
  
  const handleSeeOnMap = () => {
    if (onSeeOnMap) {
      onSeeOnMap(id);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-primary">
                {formattedStorybook?.header || title || 'Planning Application'}
              </h3>
              
              <div className="mt-2 flex flex-wrap gap-2">
                <ApplicationBadges
                  status={status}
                  lastDateConsultationComments={last_date_consultation_comments}
                />
              </div>
              
              {/* Address, distance, and received date */}
              <div className="mt-4 text-sm text-gray-600 space-y-2">
                <p className="flex items-start gap-1.5">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="flex flex-col">
                    <span className="line-clamp-1">{address}</span>
                    {distance && <span className="text-xs text-gray-500 mt-0.5">({distance} from search location)</span>}
                  </span>
                </p>
                
                {formattedDate && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Received: {formattedDate}</span>
                  </p>
                )}
              </div>
            </div>
            
            {formattedStorybook?.content ? (
              <div 
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: formattedStorybook.content 
                }} 
              />
            ) : (
              <p className="text-gray-700">
                {description || 'No description available for this planning application.'}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 pt-2">
              {application.coordinates && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSeeOnMap}
                  className="flex items-center gap-1.5"
                >
                  <MapPin className="h-4 w-4" />
                  See on Map
                </Button>
              )}
              
              <a 
                href={`/application/${id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                View Details
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
