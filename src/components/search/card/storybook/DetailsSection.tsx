
import { FC, useEffect } from "react";
import { logStorybook } from "@/utils/storybook/logger";

interface DetailsSectionProps {
  content: string | string[] | null;
  applicationId?: number;
}

export const DetailsSection: FC<DetailsSectionProps> = ({ content, applicationId }) => {
  if (!content) return null;
  
  // Debug logging
  useEffect(() => {
    logStorybook.section('details', content, applicationId);
  }, [content, applicationId]);
  
  // Process HTML content
  const processContent = (str: string) => {
    // Clean up common prefix issues
    return str
      .replace(/^Key Details:?\s*/i, '') // Remove redundant title at start
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>'); // Convert encoded HTML tags
  };
  
  // More robust empty content check
  const isEmptyContent = (str: string) => {
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };
  
  // Enhanced emoji detection
  const extractEmoji = (text: string) => {
    const emojiRegex = /^([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}]+)/u;
    const match = text.match(emojiRegex);
    
    if (match) {
      return {
        emoji: match[1],
        text: text.substring(match[0].length).trim()
      };
    }
    
    return { emoji: null, text };
  };
  
  // Format the content with proper bullet points
  const formatBulletPoints = (inputContent: string | string[]) => {
    if (Array.isArray(inputContent)) {
      // If the content is already an array, format each item
      return (
        <ul className="list-disc pl-5 space-y-2 my-0 text-left">
          {inputContent
            .filter(item => item && !isEmptyContent(item))
            .map((item, index) => {
              const { emoji, text } = extractEmoji(processContent(item));
              return (
                <li key={index} className="pl-1 mb-2 text-left flex items-start gap-2">
                  {emoji ? (
                    <>
                      <span className="flex-shrink-0 mr-2">{emoji}</span>
                      <span 
                        dangerouslySetInnerHTML={{ 
                          __html: text.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                        }}
                        className="flex-1"
                      />
                    </>
                  ) : (
                    <span
                      dangerouslySetInnerHTML={{ 
                        __html: processContent(item).replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                      }}
                    />
                  )}
                </li>
              );
            })}
        </ul>
      );
    } else {
      // Handle string content by detecting bullet points
      const contentStr = processContent(inputContent);
      
      // Check if content has recognizable bullet points
      const hasBulletPoints = /(?:^|\n)\s*(?:[•\*\-]|\p{Emoji_Presentation})\s+/u.test(contentStr);
      
      if (hasBulletPoints) {
        // Split by bullet point markers
        const bulletPoints = contentStr.split(/(?:^|\n)\s*(?:[•\*\-]|\p{Emoji_Presentation})\s+/u)
          .filter(Boolean)
          .map(item => item.trim());
        
        if (bulletPoints.length > 1) {
          return (
            <ul className="list-disc pl-5 space-y-2 my-0 text-left">
              {bulletPoints.map((item, i) => (
                <li key={i} className="pl-1 mb-2 text-left">
                  <span 
                    dangerouslySetInnerHTML={{ 
                      __html: item.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                    }}
                  />
                </li>
              ))}
            </ul>
          );
        }
      }
      
      // If no bullet points or only one item, render as paragraph
      return (
        <p className="my-0 mt-2 text-left whitespace-pre-line" 
          dangerouslySetInnerHTML={{ 
            __html: contentStr.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
          }}
        />
      );
    }
  };
  
  // If after processing we have no content, return null
  if ((typeof content === 'string' && isEmptyContent(content)) || 
      (Array.isArray(content) && content.every(isEmptyContent))) return null;
  
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4">
      <h3 className="font-semibold mb-2 text-base md:text-lg text-left">Key Details</h3>
      <div className="space-y-2 text-gray-700">
        {formatBulletPoints(content)}
      </div>
    </div>
  );
};
