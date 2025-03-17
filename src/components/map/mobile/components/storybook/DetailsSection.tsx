
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
      <ul className="space-y-2 mt-2">
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
      // Split the content by lines to find headers and sections
      const lines = content.split(/\n+/).filter(line => line.trim());
      
      if (lines.length > 0) {
        // Format the lines with proper headers and bullet points
        const formattedContent = [];
        let currentSection = null;
        let sectionContent = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Check if the line is a section header
          if (line.match(/^(The Details:|Details:|Considerations:|Key Considerations:)/i)) {
            // If we already have a section, add it to the formatted content
            if (currentSection && sectionContent.length > 0) {
              formattedContent.push(
                <div key={`section-${formattedContent.length}`} className="mb-3">
                  {currentSection}
                  {sectionContent}
                </div>
              );
            }
            
            // Start a new section with bold heading
            currentSection = <h4 key={`header-${i}`} className="font-bold text-gray-800 text-left my-2">{line}</h4>;
            sectionContent = [];
          } else if (line.match(/^[•\*\-]\s+/)) {
            // This is a bullet point
            const bulletContent = line.replace(/^[•\*\-]\s+/, '');
            sectionContent.push(
              <li key={`bullet-${i}`} className="flex items-start gap-2 mb-2 text-left">
                <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="flex-1">{bulletContent}</span>
              </li>
            );
          } else {
            // Regular text
            sectionContent.push(<p key={`text-${i}`} className="text-left mb-2">{line}</p>);
          }
        }
        
        // Add the last section if there is one
        if (currentSection) {
          formattedContent.push(
            <div key={`section-${formattedContent.length}`} className="mb-3">
              {currentSection}
              {sectionContent.length > 0 ? (
                <ul className="list-none pl-0 space-y-1">{sectionContent}</ul>
              ) : null}
            </div>
          );
        } else if (sectionContent.length > 0) {
          formattedContent.push(
            <div key="content" className="mb-3">
              <ul className="list-none pl-0 space-y-1">{sectionContent}</ul>
            </div>
          );
        }
        
        detailContent = <div>{formattedContent}</div>;
      } else {
        // Fallback if no lines were found
        detailContent = <p className="text-left">{content}</p>;
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
