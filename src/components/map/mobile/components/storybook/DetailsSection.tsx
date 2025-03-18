
import { ReactNode } from "react";

interface DetailsSectionProps {
  content: string | string[] | undefined;
}

// Extract emoji from beginning of text
const extractEmoji = (text: string) => {
  const emojiMatch = text.match(/^([\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/u);
  return {
    emoji: emojiMatch ? emojiMatch[1] : null,
    text: emojiMatch ? text.substring(emojiMatch[0].length).trim() : text
  };
};

// Format section headers to be bold
const formatSectionHeader = (text: string) => {
  // Check if text starts with a common section header format
  const headerMatch = text.match(/^(The Details:|Details:|Considerations:|Key Considerations:)(.*)/i);
  
  if (headerMatch) {
    return (
      <h4 className="font-bold text-gray-800 text-left my-3">{headerMatch[1]}</h4>
    );
  }
  
  return <p className="text-left">{text}</p>;
};

export const DetailsSection = ({ content }: DetailsSectionProps) => {
  if (!content) return null;
  
  let detailContent: ReactNode;
  
  if (Array.isArray(content)) {
    detailContent = (
      <ul className="space-y-2 mt-2 list-none pl-0">
        {content
          .filter((detail: string) => detail && detail.trim().length > 0)
          .map((detail: string, index: number) => {
            const { emoji, text } = extractEmoji(detail);
            return (
              <li key={index} className="flex items-start gap-2 mb-2 text-left">
                <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 break-words">
                  {emoji && <span className="mr-1 inline-block align-middle">{emoji}</span>}
                  <span>{text}</span>
                </div>
              </li>
            );
          })}
      </ul>
    );
  } else {
    // Process string content to handle section headers and bullet points
    if (typeof content === 'string') {
      // Check if content contains bullet points (•, *, -)
      if (content.includes('•') || content.includes('*') || content.includes('-')) {
        // Process bullet points with better extraction
        const bulletMatches = [...content.matchAll(/(?:^|\n)\s*([•\*\-])\s*(.*?)(?=(?:\n\s*[•\*\-]|$))/gs)];
        
        if (bulletMatches.length > 0) {
          detailContent = (
            <ul className="space-y-2 mt-2 list-none pl-0">
              {bulletMatches.map((match, index) => {
                const bulletText = match[2]?.trim();
                if (!bulletText) return null;
                
                // Extract emoji if present
                const { emoji, text } = extractEmoji(bulletText);
                
                return (
                  <li key={index} className="flex items-start gap-2 mb-2 text-left">
                    <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 break-words">
                      {emoji && <span className="mr-1 inline-block align-middle">{emoji}</span>}
                      <span>{text}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          );
        } else {
          // Fallback for no matches
          detailContent = <p className="text-left">{content}</p>;
        }
      } else {
        // Split the content by lines to find headers and sections
        const lines = content.split(/\n+/).filter(line => line.trim());
        
        if (lines.length > 1) {
          // Format the lines with proper headers
          detailContent = (
            <div className="space-y-2">
              {lines.map((line, index) => formatSectionHeader(line))}
            </div>
          );
        } else {
          // Single line, no special formatting needed
          detailContent = <p className="text-left">{content}</p>;
        }
      }
    } else {
      // Fallback for non-string content
      detailContent = <p className="text-left">No details available</p>;
    }
  }
  
  return (
    <div className="mb-4">
      <p className="font-bold text-gray-800 text-left">Key Details</p>
      <div className="mt-1">
        {detailContent}
      </div>
    </div>
  );
};
