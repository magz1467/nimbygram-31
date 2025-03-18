
import { StorySection } from '../types';

/**
 * Extracts bullet points from content, regardless of type of bullet marker
 */
export function extractBulletPoints(content: string): StorySection[] {
  if (!content) return [];

  console.log('Extracting bullet points from content');
  
  // Define a more comprehensive regex for emoji bullet points and regular bullet points
  // This regex will match emoji characters followed by space, as well as traditional bullet markers
  const bulletPointRegex = /(?:^|\n)\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+(.*?)(?=(?:^|\n)\s*(?:[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+|\n\n|$)/gsu;
  
  const bulletMatches = Array.from(content.matchAll(bulletPointRegex));
  
  // If we find bullet points, process them
  if (bulletMatches.length > 0) {
    console.log(`Found ${bulletMatches.length} bullet points in content`);
    
    // Try to identify sections by looking at content before bullet points or headers in the content
    const dealSection = content.match(/What['']s the Deal[:.]?/i);
    const detailsSection = content.match(/Key Details[:.]?/i);
    
    // If we identified clear sections, parse accordingly, otherwise put all under details
    if (dealSection || detailsSection) {
      const sections: StorySection[] = [];
      
      // Extract bullet points between "What's the Deal" and "Key Details" for deal section
      if (dealSection) {
        const dealContent = extractSectionContent(content, /What['']s the Deal[:.]?/i, /Key Details[:.]?|Nimbywatch[:.]?|What to Watch Out For[:.]?|$/i);
        if (dealContent) {
          sections.push({
            type: 'deal',
            title: "What's the Deal",
            content: dealContent
          });
        }
      }
      
      // Extract bullet points after "Key Details" for details section
      if (detailsSection) {
        const detailsContent = extractSectionContent(content, /Key Details[:.]?/i, /Nimbywatch[:.]?|What to Watch Out For[:.]?|$/i);
        if (detailsContent) {
          // For details section, extract individual bullet points as array
          const bulletPoints = extractBulletPointsList(detailsContent);
          sections.push({
            type: 'details',
            title: "Key Details",
            content: bulletPoints.length > 0 ? bulletPoints : detailsContent
          });
        }
      }
      
      // Handle Nimbywatch section if it exists
      const nimbyMatch = content.match(/Nimbywatch[:.]?/i);
      if (nimbyMatch) {
        const nimbyContent = extractSectionContent(content, /Nimbywatch[:.]?/i, /What to Watch Out For[:.]?|$/i);
        if (nimbyContent) {
          sections.push({
            type: 'nimby',
            title: "Nimbywatch",
            content: nimbyContent
          });
        }
      }
      
      // Handle What to Watch Out For section if it exists
      const watchOutForMatch = content.match(/What to Watch Out For[:.]?/i);
      if (watchOutForMatch) {
        const watchOutForContent = extractSectionContent(content, /What to Watch Out For[:.]?/i, /$/i);
        if (watchOutForContent) {
          sections.push({
            type: 'watchOutFor',
            title: "What to Watch Out For",
            content: watchOutForContent
          });
        }
      }
      
      return sections;
    } else {
      // If no clear sections found, treat all bullet points as details
      const bulletPoints = extractBulletPointsList(content);
      
      return [{
        type: 'details',
        title: 'Key Details',
        content: bulletPoints
      }];
    }
  }
  
  return [];
}

/**
 * Extract content between two section headers
 */
function extractSectionContent(content: string, startPattern: RegExp, endPattern: RegExp): string {
  // Find the starting position of the section
  const startMatch = content.match(startPattern);
  if (!startMatch) return '';
  
  const startPos = startMatch.index! + startMatch[0].length;
  
  // Find the ending position (start of next section or end of content)
  const remainingContent = content.slice(startPos);
  const endMatch = remainingContent.match(endPattern);
  const endPos = endMatch ? endMatch.index! : remainingContent.length;
  
  // Extract the section content
  return remainingContent.slice(0, endPos).trim();
}

/**
 * Extract individual bullet points as an array from content
 */
function extractBulletPointsList(content: string): string[] {
  const bulletPoints: string[] = [];
  
  // Enhanced regex for bullet points with emojis and traditional markers
  const bulletPointRegex = /(?:^|\n)\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+(.*?)(?=(?:^|\n)\s*(?:[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+|\n\n|$)/gsu;
  
  const bulletMatches = Array.from(content.matchAll(bulletPointRegex));
  
  bulletMatches.forEach(match => {
    const marker = match[1]; // The bullet marker (emoji or traditional)
    const text = match[2].trim(); // The text content
    
    // For emoji bullets, include the emoji in the text
    if (/[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]/u.test(marker)) {
      bulletPoints.push(`${marker} ${text}`);
    } else {
      bulletPoints.push(text);
    }
  });
  
  return bulletPoints;
}
