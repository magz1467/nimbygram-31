
import { StorySection } from '../types';

/**
 * Parses storybook content into sections using a regex pattern
 */
export function parseSections(bodyContent: string): StorySection[] {
  const processedSections: StorySection[] = [];
  
  // Use a more robust pattern to match section titles with their content
  const sectionPattern = /(?:^|\n)(What['']s the Deal:|Key Details:|Nimbywatch:|What to Watch Out For:|Key Regulations:)(.*?)(?=(?:^|\n)(?:What['']s the Deal:|Key Details:|Nimbywatch:|What to Watch Out For:|Key Regulations:)|$)/gis;
  
  const sectionMatches = [...bodyContent.matchAll(sectionPattern)];
  
  if (sectionMatches.length > 0) {
    sectionMatches.forEach(match => {
      const sectionTitle = match[1].trim();
      let sectionContent = match[2].trim();
      
      // Skip if section content is empty
      if (!sectionContent) return;
      
      // Determine section type
      let sectionType = '';
      if (/What['']s the Deal:/i.test(sectionTitle)) {
        sectionType = 'deal';
      } else if (/Key Details:/i.test(sectionTitle)) {
        sectionType = 'details';
      } else if (/Nimbywatch:/i.test(sectionTitle)) {
        sectionType = 'nimby';
      } else if (/What to Watch Out For:/i.test(sectionTitle)) {
        sectionType = 'watchOutFor';
      } else if (/Key Regulations:/i.test(sectionTitle)) {
        sectionType = 'keyRegulations';
      }
      
      // Clean bullet points and prepare content
      sectionContent = sectionContent
        .replace(/^\s*[\*•-]\s*$/gm, '') // Remove empty bullet points
        .replace(/\n\s*[\*•-]\s*\n/g, '\n') // Remove empty bullets with newlines
        .replace(/\n{3,}/g, '\n\n'); // Normalize excessive newlines
      
      // Extract bullet points if any
      const hasBulletPoints = sectionContent.match(/(?:^|\n)\s*[•\*\-✓🔍🏠🏢]/m);
      
      // Process details section for bullet points
      if (sectionType === 'details' && hasBulletPoints) {
        // Extract bullet points
        const bulletPoints = [];
        const bulletRegex = /(?:^|\n)\s*([•\*\-✓🔍🏠🏢])\s+(.*?)(?=(?:^|\n)\s*[•\*\-✓🔍🏠🏢]|$)/gs;
        const bulletMatches = [...sectionContent.matchAll(bulletRegex)];
        
        bulletMatches.forEach(bulletMatch => {
          const text = bulletMatch[2].trim();
          if (text) { // Only add if there's actual content
            bulletPoints.push(text);
          }
        });
        
        if (bulletPoints.length > 0) {
          // Check for content before the first bullet point
          const firstBulletStart = sectionContent.indexOf(bulletMatches[0][0]);
          let introText = '';
          
          if (firstBulletStart > 0) {
            introText = sectionContent.substring(0, firstBulletStart).trim();
          }
          
          // If there's intro text, add it as a separate bullet point
          if (introText) {
            bulletPoints.unshift(introText);
          }
          
          processedSections.push({
            type: sectionType,
            title: sectionTitle.replace(/:$/, ''),
            content: bulletPoints
          });
          return;
        }
      }
      
      // Add the section
      processedSections.push({
        type: sectionType,
        title: sectionTitle.replace(/:$/, ''),
        content: sectionContent
      });
    });
  }

  return processedSections;
}
