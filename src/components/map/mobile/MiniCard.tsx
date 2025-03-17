
import { Application } from "@/types/planning";
import { MapPin } from "lucide-react";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getImageUrl } from "@/utils/imageUtils";
import { formatStorybook } from "@/utils/storybook-formatter";
import { useEffect } from "react";

interface MiniCardProps {
  application: Application;
  onClick: () => void;
}

export const MiniCard = ({ application, onClick }: MiniCardProps) => {
  const formattedStorybook = formatStorybook(application.storybook);
  
  console.log('🎯 MiniCard rendering with:', {
    applicationId: application.id,
    hasStorybook: !!application.storybook,
    formattedStorybook: {
      hasHeader: !!formattedStorybook?.header,
      hasSections: !!formattedStorybook?.sections,
      sectionCount: formattedStorybook?.sections?.length || 0,
      rawPreview: application.storybook ? application.storybook.substring(0, 100) + '...' : 'none'
    },
    imageUrl: application.streetview_url || application.image || application.image_map_url
  });

  // Get the best available image
  const imageUrl = getImageUrl(application.streetview_url || application.image || application.image_map_url);

  // Extract emoji from beginning of text
  const extractEmoji = (text: string) => {
    const emojiMatch = text.match(/^([\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/u);
    return {
      emoji: emojiMatch ? emojiMatch[1] : null,
      text: emojiMatch ? text.substring(emojiMatch[0].length).trim() : text
    };
  };

  useEffect(() => {
    console.log('🔍 MiniCard mounted with styles:', {
      container: document.querySelector('.fixed.bottom-0')?.className,
      image: document.querySelector('.aspect-video')?.className
    });
    return () => {
      console.log('👋 MiniCard unmounting');
    };
  }, []);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-lg shadow-lg z-[1000] max-h-[75vh] overflow-y-auto"
      onClick={(e) => {
        console.log('🖱️ MiniCard container clicked');
        onClick();
      }}
    >
      <div className="drag-handle w-12 h-1 bg-gray-300 rounded-full mx-auto my-2" />
      
      <div className="flex flex-col p-4 cursor-pointer touch-pan-y">
        {/* Title Section */}
        <div className="font-semibold text-primary mb-3 text-lg">
          {formattedStorybook?.header || application.title || 'Planning Application'}
        </div>

        {/* Main Image - Now larger and more prominent */}
        <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={imageUrl}
            alt={formattedStorybook?.header || application.title || ''}
            className="w-full h-full object-cover"
            fallbackSrc="/placeholder.svg"
          />
        </div>

        {/* Address with icon */}
        <p className="text-sm text-gray-600 mb-3">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-2">{application.address}</span>
          </span>
        </p>

        {/* Formatted Storybook Content */}
        {formattedStorybook?.sections ? (
          <div className="text-sm text-gray-600 mb-3">
            {formattedStorybook.sections.find(s => s.type === 'deal') && (
              <div className="mb-2">
                <p className="font-medium">What's the Deal</p>
                <p>
                  {formattedStorybook.sections.find(s => s.type === 'deal')?.content}
                </p>
              </div>
            )}
            
            {formattedStorybook.sections.find(s => s.type === 'details') && (
              <div className="mb-2">
                <p className="font-medium">Key Details</p>
                {Array.isArray(formattedStorybook.sections.find(s => s.type === 'details')?.content) ? (
                  <ul className="space-y-1.5 mt-1">
                    {formattedStorybook.sections
                      .find(s => s.type === 'details')
                      ?.content
                      .filter((detail: string) => detail && detail.trim().length > 0) // Filter out empty bullet points
                      .slice(0, 3) // Show just first 3 points for compact display
                      .map((detail: string, index: number) => {
                        const { emoji, text } = extractEmoji(detail);
                        return (
                          <li key={index} className="flex items-start gap-2">
                            <div className="min-w-[5px] min-h-[5px] w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              {emoji && <span className="mr-1">{emoji}</span>}
                              <span>{text}</span>
                            </div>
                          </li>
                        );
                      })}
                    {(formattedStorybook.sections.find(s => s.type === 'details')?.content as string[])
                        .filter((detail: string) => detail && detail.trim().length > 0).length > 3 && (
                      <li className="text-primary text-xs pl-3 mt-1">...more details</li>
                    )}
                  </ul>
                ) : (
                  <p>{formattedStorybook.sections.find(s => s.type === 'details')?.content}</p>
                )}
              </div>
            )}
            
            {formattedStorybook.sections.find(s => s.type === 'watchOutFor') && (
              <div className="mt-2 p-2 bg-pink-50 rounded-md">
                <p className="font-medium text-pink-800 flex items-center gap-1">
                  <span>👀</span> What to Watch Out For
                </p>
                <p className="text-pink-700 mt-1">
                  {formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content}
                </p>
              </div>
            )}
            
            {formattedStorybook.sections.find(s => s.type === 'keyRegulations') && (
              <div className="mt-2 p-2 bg-green-50 rounded-md">
                <p className="font-medium text-green-800 flex items-center gap-1">
                  <span>📃</span> Key Regulations
                </p>
                <p className="text-green-700 mt-1">
                  {formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content}
                </p>
              </div>
            )}
            
            {formattedStorybook.sections.find(s => s.type === 'nimby') && (
              <div className="mt-2 p-2 bg-purple-50 rounded-md">
                <p className="font-medium text-purple-800 flex items-center gap-1">
                  <span>🏘️</span> Nimbywatch
                </p>
                <p className="text-purple-700 mt-1">
                  {formattedStorybook.sections.find(s => s.type === 'nimby')?.content}
                </p>
              </div>
            )}
          </div>
        ) : formattedStorybook?.content ? (
          <div 
            className="text-sm text-gray-600 mb-3"
            dangerouslySetInnerHTML={{ 
              __html: formattedStorybook.content
            }}
          />
        ) : application.storybook ? (
          <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap line-clamp-4">
            {application.storybook}
          </p>
        ) : (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {application.description || "No description available"}
          </p>
        )}

        {/* Badges and Distance */}
        <div className="flex items-center gap-2 mt-auto">
          <ApplicationBadges
            status={application.status}
            lastDateConsultationComments={application.last_date_consultation_comments}
            impactScore={application.final_impact_score}
          />
          {application.distance && (
            <span className="text-xs text-gray-500">{application.distance}</span>
          )}
        </div>
      </div>

      {/* Pull up hint */}
      <div className="px-4 pb-4 pt-2 text-xs text-gray-500 text-center">
        Pull up to see all applications
      </div>
    </div>
  );
};
