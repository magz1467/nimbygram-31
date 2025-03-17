
import { FC } from "react";

interface DetailsSectionProps {
  content: string[] | string;
}

export const DetailsSection: FC<DetailsSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process HTML tags in content if it's a string
  const processString = (str: string) => {
    return str
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>'); // Convert encoded HTML tags
  };
  
  // More robust empty content check
  const isEmptyContent = (str: string) => {
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };
  
  // Extract emoji from start of content if present
  const getEmojiPrefix = (str: string) => {
    const emojiMatch = str.match(/^([\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/u);
    return emojiMatch ? emojiMatch[1] : null;
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Key Details</h3>
      <div className="grid gap-3">
        {Array.isArray(content) ? (
          content
            .filter((detail) => detail && !isEmptyContent(detail)) // Enhanced filter for empty entries
            .map((detail, index) => {
              const emoji = getEmojiPrefix(detail);
              const displayDetail = emoji ? detail.substring(emoji.length).trim() : detail;
              
              return (
                <div key={index} className="flex gap-2.5 items-start">
                  {/* More prominent bullet point, especially on mobile */}
                  <div className="min-w-[8px] min-h-[8px] w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="text-gray-700 flex-1">
                    {emoji && <span className="mr-1.5">{emoji}</span>}
                    <span 
                      dangerouslySetInnerHTML={{ 
                        __html: processString(displayDetail)
                      }}
                    />
                  </div>
                </div>
              );
            })
        ) : (
          // If content is a string, display it properly with paragraph styling
          <div 
            className="text-gray-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: processString(typeof content === 'string' ? content : String(content))
            }}
          />
        )}
      </div>
    </div>
  );
};
