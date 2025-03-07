import { Application } from "@/types/planning";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Calendar } from "lucide-react";
import { formatStorybook } from "@/utils/storybook-formatter";
import { ApplicationBadges } from "../applications/ApplicationBadges";
import { format } from "date-fns";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getBestApplicationImage } from "@/utils/imageUtils";

interface SearchResultCardProps {
  application: Application;
  onSeeOnMap?: (id: number) => void;
}

// Category-specific image mapping - same as ImageResolver
const CATEGORY_IMAGES = {
  'Demolition': '/lovable-uploads/7448dbb9-9558-4d5b-abd8-b9a086dc632c.png',
  'Extension': '/lovable-uploads/b0296cbb-48ab-46ec-9ac1-93c1251ca198.png',
  'New Build': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=60',
  'Change of Use': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=60',
  'Listed Building': 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&auto=format&fit=crop&q=60',
  'Commercial': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
  'Residential': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
  'Infrastructure': 'https://images.unsplash.com/photo-1621955964441-c173e01c135b?w=800&auto=format&fit=crop&q=60',
  'Planning Conditions': '/lovable-uploads/c5f375f5-c862-4a11-a43e-7dbac6a9085a.png',
  'Miscellaneous': '/lovable-uploads/ce773ff2-12e2-463a-b81e-1042a334d0cc.png'
};

export const SearchResultCard = ({ application, onSeeOnMap }: SearchResultCardProps) => {
  const { id, title, description, address, postcode, status, last_date_consultation_comments, storybook, distance, received_date, received, image, image_map_url, class_3, category } = application;
  
  const formattedStorybook = formatStorybook(storybook);
  
  // Format the received date
  const displayDate = received_date || received;
  const formattedDate = displayDate ? format(new Date(displayDate), 'dd MMM yyyy') : null;
  
  const handleSeeOnMap = () => {
    if (onSeeOnMap) {
      onSeeOnMap(id);
    }
  };

  // Get the best image for this application
  const imageSource = getBestApplicationImage(application, CATEGORY_IMAGES);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Add image at the top of the card */}
        <div className="w-full aspect-video relative">
          <ImageWithFallback
            src={imageSource}
            alt={formattedStorybook?.header || title || 'Planning Application'}
            className="w-full h-full object-cover"
            fallbackSrc={CATEGORY_IMAGES['Miscellaneous']}
            loading="eager"
          />
        </div>
        
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
