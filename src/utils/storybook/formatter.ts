
import { FormattedStorybook } from './types';
import { 
  cleanContent, 
  parseJsonContent, 
  extractHeader 
} from './content-cleaner';
import { 
  parseSections, 
  detectSections, 
  extractBulletPoints,
  splitDealDetails 
} from './section-parser';

/**
 * Formats raw storybook content into structured sections
 */
export const formatStorybook = (content: string | null): FormattedStorybook | null => {
  if (!content) {
    console.log('No storybook content provided');
    return null;
  }

  // Enhanced logging to see what we're working with
  console.log('Processing storybook content type:', typeof content);
  console.log('Processing storybook content length:', content.length);
  console.log('Processing storybook content preview:', content.substring(0, 100) + '...');

  // Parse JSON content if needed
  let processedContent = parseJsonContent(content);
  
  // Clean and normalize the content
  processedContent = cleanContent(processedContent);

  // Extract header
  const { header, bodyContent } = extractHeader(processedContent);
  
  // Process sections with better section boundary detection
  let processedSections = parseSections(bodyContent);
  
  // If no clear sections were found, try looking for emoji markers
  if (processedSections.length === 0) {
    processedSections = detectSections(bodyContent);
  }
  
  // If we still don't have clear sections, try to extract content based on bullet points
  if (processedSections.length === 0) {
    processedSections = extractBulletPoints(bodyContent);
  }
  
  // If we still don't have sections, split the content into "What's the Deal" and "Key Details"
  if (processedSections.length === 0) {
    processedSections = splitDealDetails(bodyContent);
  }
  
  // If we have sections, return them structured
  if (processedSections.length > 0) {
    console.log(`Found ${processedSections.length} storybook sections:`, 
      processedSections.map(s => s.type).join(', '));
    
    return { 
      header: header || processedSections[0]?.title || 'Planning Application', 
      sections: processedSections,
      rawContent: bodyContent // Include the raw content for fallback
    };
  }
  
  // If we've reached here, we couldn't parse the content effectively
  // Return a basic object with the original content
  return {
    header: header || 'Planning Application',
    content: `<p>${bodyContent}</p>`,
    rawContent: bodyContent
  };
};
