
import { StorySection } from './types';

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

/**
 * Attempts to detect sections from content by looking for section-like headers
 */
export function detectSections(bodyContent: string): StorySection[] {
  const processedSections: StorySection[] = [];
  
  // Try to automatically detect sections by looking for bullet patterns
  const paragraphs = bodyContent.split(/\n\n+/);
  let currentSection = '';
  let currentContent = '';
  
  for (const paragraph of paragraphs) {
    // Check if this paragraph looks like a section header
    if (paragraph.toLowerCase().includes("what's the deal") || 
        paragraph.toLowerCase().includes("key details") ||
        paragraph.toLowerCase().includes("nimbywatch") ||
        paragraph.toLowerCase().includes("what to watch out for") ||
        paragraph.toLowerCase().includes("key regulations")) {
      
      // If we have accumulated content from a previous section, save it
      if (currentSection && currentContent) {
        let sectionType = '';
        if (currentSection.toLowerCase().includes("what's the deal")) {
          sectionType = 'deal';
        } else if (currentSection.toLowerCase().includes("key details")) {
          sectionType = 'details';
        } else if (currentSection.toLowerCase().includes("nimbywatch")) {
          sectionType = 'nimby';
        } else if (currentSection.toLowerCase().includes("watch out for")) {
          sectionType = 'watchOutFor';
        } else if (currentSection.toLowerCase().includes("key regulations")) {
          sectionType = 'keyRegulations';
        }
        
        if (sectionType) {
          processedSections.push({
            type: sectionType,
            title: currentSection,
            content: currentContent.trim()
          });
        }
      }
      
      // Set up the new section
      currentSection = paragraph;
      currentContent = '';
    } else {
      // This is content for the current section
      currentContent += paragraph + '\n\n';
    }
  }
  
  // Don't forget to add the last section
  if (currentSection && currentContent) {
    let sectionType = '';
    if (currentSection.toLowerCase().includes("what's the deal")) {
      sectionType = 'deal';
    } else if (currentSection.toLowerCase().includes("key details")) {
      sectionType = 'details';
    } else if (currentSection.toLowerCase().includes("nimbywatch")) {
      sectionType = 'nimby';
    } else if (currentSection.toLowerCase().includes("watch out for")) {
      sectionType = 'watchOutFor';
    } else if (currentSection.toLowerCase().includes("key regulations")) {
      sectionType = 'keyRegulations';
    }
    
    if (sectionType) {
      processedSections.push({
        type: sectionType,
        title: currentSection,
        content: currentContent.trim()
      });
    }
  }

  return processedSections;
}

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

/**
 * Fallback for splitting content into deal/details sections
 */
export function splitDealDetails(bodyContent: string): StorySection[] {
  const processedSections: StorySection[] = [];
  
  // Try to find key phrases to split content
  const dealMatch = bodyContent.match(/.*?(?=(?:Key Details:|$))/s);
  if (dealMatch && dealMatch[0].trim()) {
    processedSections.push({
      type: 'deal',
      title: "What's the Deal",
      content: dealMatch[0].trim()
    });
    
    // Look for key details after the deal section
    const detailsMatch = bodyContent.substring(dealMatch[0].length).match(/Key Details:(.*?)(?=(?:What to Watch Out For:|Nimbywatch:|$))/s);
    if (detailsMatch && detailsMatch[1].trim()) {
      processedSections.push({
        type: 'details',
        title: "Key Details",
        content: detailsMatch[1].trim()
      });
    }
  } else {
    // If no clear structure, just treat it all as the "deal" section
    // Clean up bullet points first
    const cleanedContent = bodyContent
      .replace(/^\s*[\*•-]\s*$/gm, '') // Remove empty bullet points
      .replace(/\n\s*[\*•-]\s*\n/g, '\n') // Remove empty bullets with newlines
      .replace(/\n{3,}/g, '\n\n'); // Normalize excessive newlines
    
    processedSections.push({
      type: 'deal',
      title: "What's the Deal",
      content: cleanedContent
    });
  }

  return processedSections;
}
