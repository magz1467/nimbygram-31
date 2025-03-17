
import { StorySection } from '../types';

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
