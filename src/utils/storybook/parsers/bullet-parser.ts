
import { StorySection } from '../types';

/**
 * Extracts bullet points from content with improved robustness
 */
export function extractBulletPoints(bodyContent: string): StorySection[] {
  const processedSections: StorySection[] = [];
  
  // Normalize line endings and double spaces
  const normalizedContent = bodyContent
    .replace(/\r\n/g, '\n')
    .replace(/\n\n+/g, '\n\n')
    .trim();
  
  // Check if there are bullet points in the content
  const hasBulletPoints = normalizedContent.match(/(?:^|\n)\s*[•\*\-✓🔍🏠🏢]/m);
  
  if (hasBulletPoints) {
    // Find the position of the first bullet
    const firstBulletMatch = normalizedContent.match(/(?:^|\n)\s*[•\*\-✓🔍🏠🏢]/m);
    
    if (firstBulletMatch && firstBulletMatch.index !== undefined && firstBulletMatch.index > 0) {
      // Extract content before the first bullet as deal section
      const dealContent = normalizedContent.substring(0, firstBulletMatch.index).trim();
      
      if (dealContent) {
        processedSections.push({
          type: 'deal',
          title: "What's the Deal",
          content: dealContent
        });
      }
      
      // Extract the bullet points for details section
      const detailsContent = normalizedContent.substring(firstBulletMatch.index).trim();
      
      if (detailsContent) {
        // Extract individual bullet points with a more robust regex
        const bulletPoints: string[] = [];
        const bulletRegex = /(?:^|\n)\s*([•\*\-✓🔍🏠🏢])\s+(.*?)(?=(?:\n\s*[•\*\-✓🔍🏠🏢]|$))/gs;
        
        let match;
        while ((match = bulletRegex.exec(detailsContent)) !== null) {
          const bulletText = match[2].trim();
          if (bulletText) {
            bulletPoints.push(bulletText);
          }
        }
        
        if (bulletPoints.length > 0) {
          processedSections.push({
            type: 'details',
            title: "Key Details",
            content: bulletPoints
          });
        } else {
          // If bullet extraction failed, use the whole content
          processedSections.push({
            type: 'details',
            title: "Key Details",
            content: detailsContent
          });
        }
      }
    } else {
      // If content starts with bullets or matching failed, treat it all as key details
      const bulletPoints: string[] = [];
      const bulletRegex = /(?:^|\n)\s*([•\*\-✓🔍🏠🏢])\s+(.*?)(?=(?:\n\s*[•\*\-✓🔍🏠🏢]|$))/gs;
      
      let match;
      while ((match = bulletRegex.exec(normalizedContent)) !== null) {
        const bulletText = match[2].trim();
        if (bulletText) {
          bulletPoints.push(bulletText);
        }
      }
      
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
          content: normalizedContent
        });
      }
    }
  } else if (normalizedContent.length > 0) {
    // No bullet points found, treat all content as the deal section
    processedSections.push({
      type: 'deal',
      title: "What's the Deal",
      content: normalizedContent
    });
  }

  return processedSections;
}
