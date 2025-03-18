
import { FC } from "react";

interface DetailsSectionProps {
  content: string | string[];
}

export const DetailsSection: FC<DetailsSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process the content based on its type
  if (Array.isArray(content)) {
    // Filter out empty items and clean up content
    const filteredDetails = content
      .filter(detail => detail && detail.trim().length > 0)
      .map(detail => detail.replace(/\*\*/g, '')); // Remove ** markers
    
    if (filteredDetails.length === 0) return null;
    
    return (
      <div className="prose prose-sm max-w-none">
        <div className="rounded-lg p-4 border border-gray-100">
          <h3 className="text-gray-900 font-bold mb-3 text-base md:text-lg text-left">Key Details</h3>
          <ul className="list-disc pl-5 space-y-2">
            {filteredDetails.map((detail, index) => {
              // Extract emoji if present at the beginning
              const emojiMatch = detail.match(/^([\u{1F300}-\u{1F64F}\u{2600}-\u{26FF}✓])/u);
              const emoji = emojiMatch ? emojiMatch[1] : null;
              const textContent = emoji ? detail.substring(emoji.length).trim() : detail.trim();
                
              return (
                <li key={index} className="pl-1 mb-2 text-left">
                  {emoji && <span className="mr-2 inline-block">{emoji}</span>}
                  <span 
                    dangerouslySetInnerHTML={{ 
                      __html: textContent.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>') 
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  } else {
    // For string content, check if it contains bullet points
    const stringContent = content as string;
    
    if (!stringContent.trim()) return null;
    
    // Strip any "Key Details:" prefix and ** markers
    const cleanedContent = stringContent
      .replace(/^Key Details:?\s*/i, '')
      .replace(/\*\*/g, '')
      .replace(/^\s*[\*•-]\s*$/gm, '') // Remove empty bullet points
      .replace(/\n\s*[\*•-]\s*\n/g, '\n'); // Remove empty bullet points with newlines
    
    // Check if content has bullet points
    const hasBulletPoints = cleanedContent.match(/(?:^|\n)\s*[•\*\-]\s+/);
    
    if (hasBulletPoints) {
      // Extract bullet points with emojis
      const bulletPoints = extractFormattedBulletPoints(cleanedContent);
      
      return (
        <div className="prose prose-sm max-w-none">
          <div className="rounded-lg p-4 border border-gray-100">
            <h3 className="text-gray-900 font-bold mb-3 text-base md:text-lg text-left">Key Details</h3>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              {bulletPoints.map((item, index) => {
                // Handle emoji bullet points
                const emojiMatch = item.text.match(/^([\u{1F300}-\u{1F64F}\u{2600}-\u{26FF}✓])/u);
                
                return (
                  <li key={index} className="pl-1 mb-2 text-left">
                    {item.emoji && <span className="mr-2 inline-block">{item.emoji}</span>}
                    {item.text}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      );
    } else {
      // No bullet points, treat as simple paragraph content
      return (
        <div className="prose prose-sm max-w-none">
          <div className="rounded-lg p-4 border border-gray-100">
            <h3 className="text-gray-900 font-bold mb-3 text-base md:text-lg text-left">Key Details</h3>
            <p className="text-gray-700 mb-0 text-left">{cleanedContent}</p>
          </div>
        </div>
      );
    }
  }
};

// Extract formatted bullet points from content as objects with emoji and text
function extractFormattedBulletPoints(content: string): Array<{emoji: string | null, text: string}> {
  const bulletPoints: Array<{emoji: string | null, text: string}> = [];
  
  // Process bullet points with emoji markers and traditional bullets
  const bulletRegex = /(?:^|\n)\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+(.*?)(?=(?:^|\n)\s*(?:[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+|\n\n|$)/gsu;
  
  const matches = Array.from(content.matchAll(bulletRegex));
  
  matches.forEach(match => {
    const marker = match[1];
    const text = match[2].trim();
    
    // For emoji bullets, separate the emoji from the text
    if (/[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]/u.test(marker)) {
      bulletPoints.push({
        emoji: marker,
        text: text
      });
    } else {
      // For traditional bullet points
      bulletPoints.push({
        emoji: null,
        text: text
      });
    }
  });
  
  return bulletPoints;
}
