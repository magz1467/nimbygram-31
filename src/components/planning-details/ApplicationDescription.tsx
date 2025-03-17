
import { Card } from "@/components/ui/card";
import { Application } from "@/types/planning";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatStorybook } from "@/utils/storybook-formatter";

interface ApplicationDescriptionProps {
  application?: Application;
}

const transformText = (text: string) => {
  // Don't transform if text is not all caps
  if (text !== text.toUpperCase()) return text;
  
  // Split into words and transform each
  return text.split(' ').map(word => {
    // Skip short words that might be acronyms (like UK, US, etc)
    if (word.length <= 3) return word;
    
    // Transform the word to title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

// Extract emoji from beginning of text
const extractEmoji = (text: string) => {
  const emojiMatch = text.match(/^([\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/u);
  return {
    emoji: emojiMatch ? emojiMatch[1] : null,
    text: emojiMatch ? text.substring(emojiMatch[0].length).trim() : text
  };
};

export const ApplicationDescription = ({ application }: ApplicationDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!application) return null;

  const formattedStorybook = application.storybook 
    ? formatStorybook(application.storybook) 
    : null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Description</h3>
      <div className="relative">
        {formattedStorybook?.sections ? (
          <div className={!isExpanded ? "max-h-24 overflow-hidden" : ""}>
            {/* What's the Deal section */}
            {formattedStorybook.sections.find(s => s.type === 'deal') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">What's the Deal</h4>
                <p className="text-sm">
                  {formattedStorybook.sections.find(s => s.type === 'deal')?.content}
                </p>
              </div>
            )}
            
            {/* Key Details section */}
            {formattedStorybook.sections.find(s => s.type === 'details') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Key Details</h4>
                <div className="text-sm space-y-2">
                  {Array.isArray(formattedStorybook.sections.find(s => s.type === 'details')?.content) ? (
                    <ul className="list-none ml-0 space-y-2">
                      {formattedStorybook.sections
                        .find(s => s.type === 'details')
                        ?.content
                        .filter((detail: string) => detail && detail.trim().length > 0) // Filter out empty bullet points
                        .map((detail: string, index: number) => {
                          const { emoji, text } = extractEmoji(detail);
                          return (
                            <li key={index} className="flex items-start gap-2">
                              <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <div className="flex-1 break-words">
                                {emoji && <span className="mr-1.5">{emoji}</span>}
                                <span 
                                  dangerouslySetInnerHTML={{ 
                                    __html: text.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>') 
                                  }}
                                />
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: typeof formattedStorybook.sections.find(s => s.type === 'details')?.content === 'string'
                          ? (formattedStorybook.sections.find(s => s.type === 'details')?.content as string).replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                          : formattedStorybook.sections.find(s => s.type === 'details')?.content || ''
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            
            {/* What to Watch Out For section */}
            {formattedStorybook.sections.find(s => s.type === 'watchOutFor') && (
              <div className="mb-4 p-3 bg-[#FFDEE2] rounded-lg">
                <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                  <span>👀</span> What to Watch Out For
                </h4>
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: typeof formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content === 'string'
                      ? (formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content as string).replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                      : formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content || ''
                  }}
                />
              </div>
            )}
            
            {/* Key Regulations section */}
            {formattedStorybook.sections.find(s => s.type === 'keyRegulations') && (
              <div className="mb-4 p-3 bg-[#F2FCE2] rounded-lg">
                <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                  <span>📃</span> Key Regulations
                </h4>
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: typeof formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content === 'string'
                      ? (formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content as string).replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                      : formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content || ''
                  }}
                />
              </div>
            )}
            
            {/* Nimbywatch section */}
            {formattedStorybook.sections.find(s => s.type === 'nimby') && (
              <div className="mb-4 p-3 bg-[#8B5CF6] bg-opacity-10 rounded-lg">
                <h4 className="text-sm font-medium text-[#8B5CF6] mb-1 flex items-center gap-1">
                  <span>🏘️</span> Nimbywatch
                </h4>
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: typeof formattedStorybook.sections.find(s => s.type === 'nimby')?.content === 'string'
                      ? (formattedStorybook.sections.find(s => s.type === 'nimby')?.content as string).replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                      : formattedStorybook.sections.find(s => s.type === 'nimby')?.content || ''
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <p className={`text-sm ${!isExpanded ? "line-clamp-2" : ""}`}>
            {transformText(application.description || '')}
          </p>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-primary hover:text-primary/80 flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Show less
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show more
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
