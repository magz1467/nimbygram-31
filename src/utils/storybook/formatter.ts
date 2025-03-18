
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
} from './parsers';
import { logStorybook } from './logger';

/**
 * Formats raw storybook content into structured sections
 */
export const formatStorybook = (content: string | null, applicationId?: number): FormattedStorybook | null => {
  if (!content) {
    logStorybook.input(content, applicationId);
    logStorybook.error('initial-check', new Error('No storybook content provided'));
    return null;
  }

  // Log input content for debugging
  logStorybook.input(content, applicationId);

  try {
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
      logStorybook.output({
        header, 
        sections: processedSections
      }, applicationId);
      
      // Log each section for detailed debugging
      processedSections.forEach(section => {
        logStorybook.section(section.type, section.content, applicationId);
      });
      
      return { 
        header: header || processedSections[0]?.title || 'Planning Application', 
        sections: processedSections,
        rawContent: bodyContent // Include the raw content for fallback
      };
    }
    
    // If we've reached here, we couldn't parse the content effectively
    // Return a basic object with the original content
    const basicResult = {
      header: header || 'Planning Application',
      content: `<p>${bodyContent}</p>`,
      rawContent: bodyContent
    };
    
    logStorybook.output(basicResult, applicationId);
    return basicResult;
    
  } catch (error) {
    // Log error with content preview for debugging
    logStorybook.error('formatter', error, content);
    
    // Fallback to a basic content wrapper
    return {
      header: 'Planning Application',
      content: `<p>${content}</p>`,
      rawContent: content
    };
  }
};
