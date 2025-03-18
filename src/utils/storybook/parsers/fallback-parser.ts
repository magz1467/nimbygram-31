
import { StorySection } from '../types';

/**
 * Splits content into "What's the Deal" and "Key Details" when other parsing fails
 */
export function splitDealDetails(content: string): StorySection[] {
  if (!content) return [];
  
  console.log('Falling back to simple deal/details split');
  
  // Try a simple split approach - if content is over 200 chars,
  // the first paragraph is the Deal and the rest is Details
  const paragraphs = content.split(/\n\n+/);
  
  if (paragraphs.length >= 2 && content.length > 200) {
    const dealParagraph = paragraphs[0].trim();
    const detailsContent = paragraphs.slice(1).join('\n\n').trim();
    
    // Process emoji bullet points in details content if any
    const detailsBullets = processContentWithEmojis(detailsContent);
    
    return [
      {
        type: 'deal',
        title: "What's the Deal",
        content: dealParagraph
      },
      {
        type: 'details',
        title: "Key Details",
        content: Array.isArray(detailsBullets) && detailsBullets.length > 0 
          ? detailsBullets 
          : detailsContent
      }
    ];
  }
  
  // If we can't split it effectively, just put everything under details
  // Preprocess content to find bullet points with emojis
  const processedContent = processContentWithEmojis(content);
  
  return [{
    type: 'details',
    title: 'Application Details',
    content: Array.isArray(processedContent) && processedContent.length > 0
      ? processedContent
      : content
  }];
}

/**
 * Process content to find and format emoji bullet points
 */
function processContentWithEmojis(content: string): string[] | string {
  // Check if content has emoji bullets (common pattern in storybooks)
  const emojiRegex = /(?:^|\n)\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓])\s+(.*?)(?=(?:^|\n)\s*(?:[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓])\s+|\n\n|$)/gsu;
  
  const emojiMatches = Array.from(content.matchAll(emojiRegex));
  
  // If we found emoji bullet points, process them specially
  if (emojiMatches.length > 0) {
    const bulletPoints: string[] = [];
    
    emojiMatches.forEach(match => {
      const emoji = match[1]; // The emoji
      const text = match[2].trim(); // The text
      
      bulletPoints.push(`${emoji} ${text}`);
    });
    
    return bulletPoints;
  }
  
  // Check for traditional bullet points too
  const bulletRegex = /(?:^|\n)\s*([•\*\-])\s+(.*?)(?=(?:^|\n)\s*(?:[•\*\-])\s+|\n\n|$)/gs;
  
  const bulletMatches = Array.from(content.matchAll(bulletRegex));
  
  if (bulletMatches.length > 0) {
    return bulletMatches.map(match => match[2].trim());
  }
  
  // If no bullet points found, return the original content
  return content;
}
