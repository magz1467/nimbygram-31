
import { FormattedStorybook } from './types';

/**
 * Cleans and normalizes raw storybook content
 */
export function cleanContent(content: string): string {
  // Enhanced logging to see what we're working with
  console.log('Cleaning storybook content type:', typeof content);
  console.log('Cleaning storybook content length:', content.length);
  console.log('Cleaning storybook content preview:', content.substring(0, 100) + '...');

  // Clean up formatting issues - improved version
  return content
    // Normalize section headers (add colon if missing)
    .replace(/What['']s the Deal(?!\:)/gi, "What's the Deal:")
    .replace(/Key Details(?!\:)/gi, "Key Details:")
    .replace(/What to Watch Out For(?!\:)/gi, "What to Watch Out For:")
    .replace(/Nimbywatch(?!\:)/gi, "Nimbywatch:")
    .replace(/Key Regulations(?!\:)/gi, "Key Regulations:")
    // Ensure sections have proper spacing
    .replace(/(What['']s the Deal:)/gi, "\n$1")
    .replace(/(Key Details:)/gi, "\n$1")
    .replace(/(What to Watch Out For:)/gi, "\n$1")
    .replace(/(Nimbywatch:)/gi, "\n$1")
    .replace(/(Key Regulations:)/gi, "\n$1")
    // Remove standalone asterisks that appear as bullets
    .replace(/\n\s*\*\s*\n/g, '\n') // Remove asterisks on their own line
    .replace(/^\s*\*\s*$/gm, '') // Remove standalone asterisks at start of lines
    .replace(/\n\s*•\s*\n/g, '\n') // Remove empty bullet points with bullet character
    .replace(/\n\s*-\s*\n/g, '\n') // Remove empty bullet points with dash
    .replace(/\n\s*\*\s*$/gm, '') // Remove trailing asterisks with no content
    .replace(/\n\s*•\s*$/gm, '') // Remove trailing bullet points with no content
    .replace(/\n\s*-\s*$/gm, '') // Remove trailing dashes with no content
    .replace(/\n\s*[\*•-]\s+\n/g, '\n') // Handle bullet points with only whitespace after them
    // Normalize double asterisks for formatting
    .replace(/\*\*/g, '') // Remove double asterisks completely
    // Process HTML tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert HTML entities to HTML tags
    .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>') // Ensure strong tags are processed
    // Normalize bullet points with emojis - make sure emoji is part of the bullet content
    .replace(
      /(\n\s*[•\*\-]\s*)([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}✓])/gu, 
      '$1$2 '
    );
}

/**
 * Attempts to parse JSON content if needed
 */
export function parseJsonContent(content: string): string {
  let processedContent = content;
  
  // Check if content is JSON string and try to parse it
  if (typeof content === 'string' && 
      (content.trim().startsWith('{') || content.trim().startsWith('['))) {
    try {
      const parsedContent = JSON.parse(content);
      console.log('Successfully parsed JSON storybook content');
      
      if (typeof parsedContent === 'string') {
        // If it's a string inside JSON, use that
        processedContent = parsedContent;
      } else if (parsedContent.content) {
        // If it has a content property, use that
        processedContent = parsedContent.content;
      } else if (parsedContent.text) {
        // Some might use 'text' property
        processedContent = parsedContent.text;
      } else if (typeof parsedContent === 'object') {
        // Try to convert object to string for display
        processedContent = JSON.stringify(parsedContent, null, 2);
      }
    } catch (error) {
      console.log('Storybook content is not valid JSON, treating as string');
    }
  }
  
  return processedContent;
}

/**
 * Extracts the header from content if it exists
 */
export function extractHeader(content: string): { header: string | null, bodyContent: string } {
  // Extract header if it exists
  const headerMatch = content.match(/<header>(.*?)<\/header>/s) || 
                     content.match(/^# (.*?)(\n|$)/m) ||
                     content.match(/^Title: (.*?)(\n|$)/mi);
  
  const header = headerMatch ? headerMatch[1].trim() : null;
  
  // Get content without the header tags
  let bodyContent = content
    .replace(/<header>.*?<\/header>/gs, '')
    .replace(/^# .*?(\n|$)/m, '')
    .replace(/^Title: .*?(\n|$)/mi, '')
    .trim();

  if (header) {
    // Create a sanitized version of the header for comparison
    const sanitizedHeader = header
      .replace(/[^\w\s]/g, '') // Remove special characters
      .toLowerCase()
      .trim();

    // Get the first paragraph of content
    const firstParagraph = bodyContent.split(/\n\n/)[0];
    const sanitizedFirstParagraph = firstParagraph
      ? firstParagraph.replace(/[^\w\s]/g, '').toLowerCase().trim()
      : '';

    // If the first paragraph is similar to the header, remove it
    if (sanitizedFirstParagraph && (
        sanitizedFirstParagraph.includes(sanitizedHeader) ||
        sanitizedHeader.includes(sanitizedFirstParagraph))) {
      bodyContent = bodyContent
        .replace(firstParagraph, '')
        .trim();
    }
  }

  return { header, bodyContent };
}
