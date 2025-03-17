
import { FC } from "react";

interface DetailsSectionProps {
  content: string | string[];
}

export const DetailsSection: FC<DetailsSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process the content based on its type
  if (Array.isArray(content)) {
    // Filter out empty items
    const filteredDetails = content.filter(detail => detail && detail.trim().length > 0);
    
    if (filteredDetails.length === 0) return null;
    
    return (
      <div className="prose prose-sm max-w-none">
        <div className="rounded-lg p-4 border border-gray-100">
          <h3 className="text-gray-900 font-semibold mb-3 text-base md:text-lg">Key Details</h3>
          <ul className="list-disc pl-5 space-y-2">
            {filteredDetails.map((detail, index) => {
              // Extract emoji if present at the beginning
              const emojiMatch = detail.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}✓])/u);
              const emoji = emojiMatch ? emojiMatch[1] : null;
              const textContent = emoji ? detail.substring(emoji.length).trim() : detail.trim();
                
              return (
                <li key={index} className="pl-1 mb-2">
                  {emoji && <span className="mr-2">{emoji}</span>}
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
    
    // Strip any "Key Details:" prefix
    const cleanedContent = stringContent.replace(/^Key Details:?\s*/i, '');
    
    // Check if the content contains bullet points or symbols
    const hasBullets = /(?:[•\*\-✓🔍🏠🏢])/m.test(cleanedContent);
    
    let formattedContent;
    if (hasBullets) {
      // Extract bullet points
      const bulletRegex = /(?:^|\n)\s*([•\*\-✓🔍🏠🏢])\s+(.*?)(?=(?:^|\n)\s*[•\*\-✓🔍🏠🏢]|$)/gs;
      const bulletMatches = [...cleanedContent.matchAll(bulletRegex)];
      
      formattedContent = `<ul class="list-disc pl-5 space-y-2">`;
      bulletMatches.forEach(match => {
        const bulletPoint = match[2].trim();
        if (bulletPoint) {
          formattedContent += `<li class="pl-1 mb-2">${bulletPoint}</li>`;
        }
      });
      formattedContent += `</ul>`;
      
      // Get content before the first bullet point
      if (bulletMatches.length > 0) {
        const beforeBullets = cleanedContent.split(bulletMatches[0][0])[0].trim();
        if (beforeBullets) {
          formattedContent = `<p class="mb-2">${beforeBullets}</p>${formattedContent}`;
        }
      }
    } else {
      // Split by paragraphs and format
      formattedContent = cleanedContent
        .split(/\n\n+/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => `<p class="mb-2">${paragraph.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')}</p>`)
        .join('');
    }
    
    return (
      <div className="prose prose-sm max-w-none">
        <div className="rounded-lg p-4 border border-gray-100">
          <h3 className="text-gray-900 font-semibold mb-3 text-base md:text-lg">Key Details</h3>
          <div 
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>
      </div>
    );
  }
};
