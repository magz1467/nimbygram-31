
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
      {/* Header Section */}
      <header className="px-4 py-4 text-center">
        <h2 className="font-semibold text-lg text-primary mb-2">
          {storybook?.header || application.title || 'Planning Application'}
        </h2>
        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
          <MapPin className="h-4 w-4" />
          {application.address}
        </p>
      </header>

      {/* Image Section */}
      <div className="relative w-full aspect-[4/3]">
        {typeof application.streetview_url === 'string' && application.streetview_url && (
          <img
            src={application.streetview_url}
            alt={storybook?.header || application.title || 'Planning application image'}
            className="w-full h-full object-cover rounded-lg"
          />
        )}
      </div>

      {/* Content Section */}
      <div className="px-8 py-4">
        {storybook?.content && (
          <div className="space-y-4">
            {/* What's the Deal Section */}
            <div className="prose prose-sm max-w-none">
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <h3 className="text-primary font-semibold mb-2">What's the Deal</h3>
                <div className="text-gray-700">
                  {storybook.content.split('The Details:')[0]}
                </div>
              </div>

              {/* Key Details Section */}
              <div className="grid gap-4 mb-4">
                {storybook.content
                  .split('The Details:')[1]
                  ?.split('Considerations:')[0]
                  .split('•')
                  .filter(Boolean)
                  .map((detail, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <p className="text-gray-700">{detail.trim()}</p>
                    </div>
                  ))}
              </div>

              {/* Nimbywatch Section */}
              {storybook.content.includes('Nimbywatch:') && (
                <div className="bg-[#8B5CF6] text-white rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    🏘️ Nimbywatch
                  </h3>
                  <div className="space-y-2 text-white/90">
                    {storybook.content
                      .split('Nimbywatch:')[1]
                      .split('•')
                      .filter(Boolean)
                      .map((point, index) => (
                        <p key={index} className="text-sm">
                          {point.trim()}
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
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
