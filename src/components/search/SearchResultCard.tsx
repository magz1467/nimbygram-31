
import { Application } from "@/types/planning";
import { formatStorybook } from "@/utils/storybook-formatter";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SearchResultCardProps {
  application: Application;
}

export const SearchResultCard = ({ application }: SearchResultCardProps) => {
  const navigate = useNavigate();
  const storybook = formatStorybook(application.storybook);

  console.log('SearchResultCard - Application:', {
    id: application.id,
    title: application.title,
    streetview_url: application.streetview_url,
    type: typeof application.streetview_url
  });

  const handleSeeOnMap = () => {
    navigate('/map', {
      state: {
        selectedApplication: application,
        coordinates: application.coordinates
      }
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto mb-8">
      {/* Header Section - Centered above image */}
      <header className="px-4 py-4 text-center">
        <h2 className="font-semibold text-lg text-primary mb-2">
          {storybook?.header || application.title || 'Planning Application'}
        </h2>
        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
          <MapPin className="h-4 w-4" />
          {application.address}
        </p>
      </header>

      {/* Image Section - Full width */}
      <div className="relative w-full aspect-[4/3]">
        {typeof application.streetview_url === 'string' && application.streetview_url && (
          <img
            src={application.streetview_url}
            alt={storybook?.header || application.title || 'Planning application image'}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content Section - Centered below image with consistent width */}
      <div className="px-8 py-4">
        {storybook?.content && (
          <div 
            className="text-gray-600 text-sm prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: storybook.content }}
          />
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSeeOnMap}
            className="text-primary"
          >
            <MapPin className="w-4 h-4 mr-2" />
            See on map
          </Button>
        </div>
      </div>
    </article>
  );
};
