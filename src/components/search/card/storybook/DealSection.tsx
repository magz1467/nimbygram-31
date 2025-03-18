
import { FC } from "react";

interface DealSectionProps {
  content: string;
}

export const DealSection: FC<DealSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // More robust empty content check
  const isEmptyContent = (str: string) => {
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };
  
  // Return null if content is effectively empty
  if (isEmptyContent(content)) return null;
  
  // Clean up the content - remove redundant titles and formatting markers
  let processedContent = content
    .replace(/^What['']s the Deal:?\s*/i, '') // Remove redundant title at start
    .replace(/What['']s the Deal:?\s*/i, '') // Also remove it if it appears later
    .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert encoded HTML tags
    .replace(/\*\*/g, '') // Remove any ** markers completely
    .replace(/^\s*[\*•-]\s*$/gm, '') // Remove empty bullet points
    .replace(/\n\s*[\*•-]\s*\n/g, '\n'); // Remove empty bullet points with newlines
  
  // Remove any "Key Details:" section that might be mixed in
  processedContent = processedContent.split(/Key Details:?/i)[0];
  
  // Remove any "What to Watch Out For:" section that might be mixed in
  processedContent = processedContent.split(/What to Watch Out For:?/i)[0];
  
  // Check if the content contains bullet points
  const hasBulletPoints = processedContent.match(/(?:^|\n)\s*[•\*\-]\s+/);
  
  if (hasBulletPoints) {
    // Extract bullet points
    const bulletPoints = [];
    const sections = [];
    let currentText = '';
    
    // Split by lines and process
    const lines = processedContent.split(/\n/);
    
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
        <div className="bg-primary/5 rounded-lg p-4">
          <h3 className="text-primary font-semibold mb-3 text-base md:text-lg text-left">What's the Deal</h3>
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
        <div className="bg-primary/5 rounded-lg p-4">
          <h3 className="text-primary font-semibold mb-3 text-base md:text-lg text-left">What's the Deal</h3>
          <p className="text-gray-700 mb-0 text-left">{processedContent}</p>
        </div>
      </div>
    );
  }
};
