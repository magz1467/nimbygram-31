
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
              <div className="mb-4 bg-primary/5 rounded-lg p-3">
                <p className="font-medium text-primary">What's the Deal</p>
                <div className="mt-1">
                  {typeof formattedStorybook.sections.find(s => s.type === 'deal')?.content === 'string' ? (
                    <p>{formattedStorybook.sections.find(s => s.type === 'deal')?.content}</p>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formattedStorybook.sections.find(s => s.type === 'deal')?.content as string 
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            
            {formattedStorybook.sections.find(s => s.type === 'details') && (
              <div className="mb-4">
                <p className="font-medium text-gray-800">Key Details</p>
                {Array.isArray(formattedStorybook.sections.find(s => s.type === 'details')?.content) ? (
                  <ul className="space-y-1.5 mt-2">
                    {formattedStorybook.sections
                      .find(s => s.type === 'details')
                      ?.content
                      .filter((detail: string) => detail && detail.trim().length > 0) // Filter out empty bullet points
                      .map((detail: string, index: number) => {
                        const { emoji, text } = extractEmoji(detail);
                        return (
                          <li key={index} className="flex items-start gap-2">
                            <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              {emoji && <span className="mr-1">{emoji}</span>}
                              <span>{text}</span>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="mt-1">{formattedStorybook.sections.find(s => s.type === 'details')?.content}</p>
                )}
              </div>
            )}
            
            {formattedStorybook.sections.find(s => s.type === 'watchOutFor') && (
              <div className="mt-3 p-3 bg-pink-50 rounded-md">
                <p className="font-medium text-pink-800 flex items-center gap-1">
                  <span>👀</span> What to Watch Out For
                </p>
                <div className="text-pink-700 mt-1">
                  {typeof formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content === 'string' ? (
                    <p>{formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content}</p>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content as string 
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            
            {formattedStorybook.sections.find(s => s.type === 'keyRegulations') && (
              <div className="mt-3 p-3 bg-green-50 rounded-md">
                <p className="font-medium text-green-800 flex items-center gap-1">
                  <span>📃</span> Key Regulations
                </p>
                <div className="text-green-700 mt-1">
                  {typeof formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content === 'string' ? (
                    <p>{formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content}</p>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content as string 
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            
            {formattedStorybook.sections.find(s => s.type === 'nimby') && (
              <div className="mt-3 p-3 bg-purple-50 rounded-md">
                <p className="font-medium text-purple-800 flex items-center gap-1">
                  <span>🏘️</span> Nimbywatch
                </p>
                <div className="text-purple-700 mt-1">
                  {typeof formattedStorybook.sections.find(s => s.type === 'nimby')?.content === 'string' ? (
                    <p>{formattedStorybook.sections.find(s => s.type === 'nimby')?.content}</p>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formattedStorybook.sections.find(s => s.type === 'nimby')?.content as string 
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : formattedStorybook?.content ? (
          <div 
            className="text-sm text-gray-600 mb-3 prose prose-sm max-w-none"
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
      <div className="px-4 pb-6 pt-2 text-xs text-center text-gray-500">
        Pull up to see all applications
      </div>
    </div>
  );
};
