
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
      // Extract bullet points
      const bulletPoints = [];
      const sections = [];
      let currentText = '';
      
      // Split by lines and process
      const lines = cleanedContent.split(/\n/);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) continue;
        
        // Check if this line is a bullet point
        if (line.match(/^\s*[•\*\-]\s+/)) {
          // If we have accumulated text, add it as a paragraph
          if (currentText.trim()) {
            sections.push(`<p class="mb-3 text-left">${currentText.trim()}</p>`);
            currentText = '';
          }
          
          // Process the bullet point
          const bulletContent = line.replace(/^\s*[•\*\-]\s+/, '');
          
          // Check for emoji at the start of the bullet content
          const emojiMatch = bulletContent.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}✓])/u);
          
          if (emojiMatch) {
            const emoji = emojiMatch[1];
            const text = bulletContent.substring(emojiMatch[0].length).trim();
            bulletPoints.push({ emoji, text });
          } else {
            bulletPoints.push({ emoji: null, text: bulletContent });
          }
        } else {
          // Not a bullet point, add to current text
          currentText += (currentText ? ' ' : '') + line;
        }
      }
      
      // Add any remaining text
      if (currentText.trim()) {
        sections.push(`<p class="mb-3 text-left">${currentText.trim()}</p>`);
      }
      
      // Format bullet points if we found any
      if (bulletPoints.length > 0) {
        let bulletList = `<ul class="list-disc pl-5 space-y-2 mb-3">`;
        bulletPoints.forEach(item => {
          bulletList += `<li class="pl-1 mb-2 text-left">`;
          if (item.emoji) {
            bulletList += `<span class="mr-2 inline-block">${item.emoji}</span>`;
          }
          bulletList += `${item.text}</li>`;
        });
        bulletList += `</ul>`;
        sections.push(bulletList);
      }
      
      const formattedContent = sections.join('');
      
      return (
        <div className="prose prose-sm max-w-none">
          <div className="rounded-lg p-4 border border-gray-100">
            <h3 className="text-gray-900 font-bold mb-3 text-base md:text-lg text-left">Key Details</h3>
            <div 
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
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
