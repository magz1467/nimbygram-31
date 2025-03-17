
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
  
  // Extract mixed content with both text and bullet points
  const sections = processedContent.split(/(?:\n\n|\r\n\r\n)/);
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
        formattedSections.push(`<p class="mb-3 text-left">${introText}</p>`);
      }
      
      // Add the bullet points list
      if (bulletItems.length > 0) {
        let bulletList = `<ul class="list-disc pl-5 space-y-2 mb-3">`;
        bulletItems.forEach(item => {
          bulletList += `<li class="pl-0 mb-2 text-left">`;
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
      formattedSections.push(`<p class="mb-3 text-left">${section}</p>`);
    }
  }
  
  // If no sections were created, fallback to simple paragraph
  if (formattedSections.length === 0) {
    formattedSections.push(`<p class="text-left">${processedContent}</p>`);
  }
  
  // Join all formatted sections
  const formattedContent = formattedSections.join('');
  
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
};
