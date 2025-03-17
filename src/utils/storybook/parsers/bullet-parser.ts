
import { StorySection } from '../types';

/**
 * Extracts bullet points from content
 */
export function extractBulletPoints(bodyContent: string): StorySection[] {
  const processedSections: StorySection[] = [];
  
  // Check if there are bullet points in the content
  const hasBulletPoints = bodyContent.match(/(?:^|\n)\s*[•\*\-✓🔍🏠🏢]/m);
  
  if (hasBulletPoints) {
    // Assume the content before the first bullet is the "What's the Deal" section
    const firstBulletMatch = bodyContent.match(/(?:^|\n)\s*[•\*\-✓🔍🏠🏢]/m);
    if (firstBulletMatch && firstBulletMatch.index > 0) {
      const dealContent = bodyContent.substring(0, firstBulletMatch.index).trim();
      if (dealContent) {
        processedSections.push({
          type: 'deal',
          title: "What's the Deal",
          content: dealContent
        });
      }
      
      // Assume the bullet points are "Key Details"
      const detailsContent = bodyContent.substring(firstBulletMatch.index).trim();
      if (detailsContent) {
        // Extract the bullet points
        const bulletPoints = [];
        const bulletRegex = /(?:^|\n)\s*([•\*\-✓🔍🏠🏢])\s+(.*?)(?=(?:^|\n)\s*[•\*\-✓🔍🏠🏢]|$)/gs;
        const bulletMatches = [...detailsContent.matchAll(bulletRegex)];
        
        bulletMatches.forEach(bulletMatch => {
          const text = bulletMatch[2].trim();
          if (text) {
            bulletPoints.push(text);
          }
        });
        
        if (bulletPoints.length > 0) {
          processedSections.push({
            type: 'details',
            title: "Key Details",
            content: bulletPoints
          });
        } else {
          processedSections.push({
            type: 'details',
            title: "Key Details",
            content: detailsContent
          });
        }
      }
    } else {
      // If the content starts with bullets, treat it all as key details
      processedSections.push({
        type: 'details',
        title: "Key Details",
        content: bodyContent
      });
    }
  }

  return processedSections;
}
