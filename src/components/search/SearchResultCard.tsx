
import { Application } from "@/types/planning";
import { formatStorybook } from "@/utils/storybook-formatter";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Image from "@/components/ui/image";

interface SearchResultCardProps {
  application: Application;
}

export const SearchResultCard = ({ application }: SearchResultCardProps) => {
  const navigate = useNavigate();
  const storybook = formatStorybook(application.storybook);

  const handleSeeOnMap = () => {
    navigate('/map', {
      state: {
        selectedApplication: application,
        coordinates: application.coordinates
      }
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with title */}
      <header className="p-4">
        <h2 className="font-semibold text-lg text-primary">
          {storybook?.header || application.title || 'Planning Application'}
        </h2>
        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {application.address}
        </p>
      </header>

      {/* Image container with text overlay */}
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={application.streetview_url || application.image_map_url || ''}
          alt={storybook?.header || application.title || 'Planning application image'}
          className="w-full h-full object-cover"
        />
        {storybook?.content && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
            <div 
              className="text-white text-sm prose prose-sm max-w-none prose-invert text-center"
              dangerouslySetInnerHTML={{ __html: storybook.content }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between">
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

