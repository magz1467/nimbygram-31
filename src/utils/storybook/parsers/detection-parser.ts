
import { StorySection } from '../types';

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
