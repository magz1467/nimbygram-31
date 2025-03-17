
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
          <h3 className="text-gray-900 font-semibold mb-3 text-base md:text-lg">Key Details</h3>
          <ul className="list-disc pl-5 space-y-2">
            {filteredDetails.map((detail, index) => {
              // Extract emoji if present at the beginning
              const emojiMatch = detail.match(/^([\u{1F300}-\u{1F64F}\u{2600}-\u{26FF}✓])/u);
              const emoji = emojiMatch ? emojiMatch[1] : null;
              const textContent = emoji ? detail.substring(emoji.length).trim() : detail.trim();
                
              return (
                <li key={index} className="pl-1 mb-2">
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
    
    // Process the content to separate text and bullet points
    const sections = cleanedContent.split(/(?:\n\n|\r\n\r\n)/);
    let formattedSections = [];
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      // Check if section contains bullet points (•, *, -)
      const hasBullets = /(?:^|\n)\s*[•\*\-]\s+/.test(section);
      
      if (hasBullets) {
        // Process bullet points with emojis
        const bulletItems = [];
        const bulletRegex = /(?:^|\n)\s*([•\*\-])\s+(.*?)(?=(?:\n\s*[•\*\-]\s+)|$)/gs;
        let match;
        
        let lastIndex = 0;
        let introText = '';
        
        // Find the first bullet point to extract any intro text
        const firstBulletMatch = section.match(/(?:^|\n)\s*[•\*\-]\s+/);
        if (firstBulletMatch && firstBulletMatch.index > 0) {
          introText = section.substring(0, firstBulletMatch.index).trim();
        }
        
        // Extract all bullet points
        while ((match = bulletRegex.exec(section)) !== null) {
          const bulletText = match[2].trim();
          if (bulletText) {
            // Look for emoji at the start of bullet text
            const emojiMatch = bulletText.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}✓])/u);
            
            if (emojiMatch) {
              const emoji = emojiMatch[1];
              const text = bulletText.substring(emojiMatch[0].length).trim();
              bulletItems.push({ emoji, text });
            } else {
              bulletItems.push({ emoji: null, text: bulletText });
            }
          }
          lastIndex = match.index + match[0].length;
        }
        
        // Add the intro text if found
        if (introText) {
          formattedSections.push(`<p class="mb-3">${introText}</p>`);
        }
        
        // Add the bullet points list
        if (bulletItems.length > 0) {
          let bulletList = `<ul class="list-disc pl-5 space-y-2 mb-3">`;
          bulletItems.forEach(item => {
            bulletList += `<li class="pl-0 mb-2">`;
            if (item.emoji) {
              bulletList += `<span class="mr-2 inline-block">${item.emoji}</span>`;
            }
            bulletList += `${item.text}</li>`;
          });
          bulletList += `</ul>`;
          formattedSections.push(bulletList);
        }
      } else {
        // For non-bullet text, just add as paragraph
        formattedSections.push(`<p class="mb-3">${section}</p>`);
      }
    }
    
    // If no sections were created, fallback to simple paragraph
    if (formattedSections.length === 0) {
      formattedSections.push(`<p>${cleanedContent}</p>`);
    }
    
    // Join all formatted sections
    const formattedContent = formattedSections.join('');
    
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
