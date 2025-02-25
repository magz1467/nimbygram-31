
export const formatStorybook = (content: string | null) => {
  if (!content) return null;

  // Extract header if it exists
  const headerMatch = content.match(/<header>(.*?)<\/header>/);
  const header = headerMatch ? headerMatch[1].trim() : null;
  
  // Get content without the header tags
  let bodyContent = content.replace(/<header>.*?<\/header>/g, '').trim();
  
  // If there's a header, remove all variations of it from the content
  if (header) {
    // Create a base version of the header by removing all formatting
    const baseHeader = header
      .replace(/\[|\]|\{|\}|\(|\)|#|\*|🏗️|🏘️|👷‍♂️|👨‍👩‍👧‍👦|📏/g, '')
      .replace(/(?:What'?s the [Dd]eal:?|The Deal:?)\s*/g, '')
      .trim();
    
    // Create regex patterns for different variations
    const patterns = [
      // Exact matches with optional whitespace
      `^\\s*${header.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`,
      // Base header with optional formatting characters
      `^\\s*[\\[\\{]*\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*[\\]\\}]*\\s*`,
      // "What's the Deal" variations
      `^\\s*(?:What'?s the [Dd]eal:?|The Deal:?)\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`,
      // Markdown headers
      `^\\s*#{1,3}\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`,
      // HTML-like tags
      `<[^>]*>${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}<\\/[^>]*>`,
      // Color formatting
      `\\[.*?\\]\\(${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`
    ];

    // Apply each pattern
    patterns.forEach(pattern => {
      try {
        const regex = new RegExp(pattern, 'gmi');
        bodyContent = bodyContent.replace(regex, '');
      } catch (e) {
        console.error('Error with regex pattern:', pattern, e);
      }
    });
  }

  // Remove any remaining markdown headers
  bodyContent = bodyContent.replace(/^#{1,3}\s+/gm, '');

  // Convert asterisk list items to bullet points
  bodyContent = bodyContent.replace(/^\*\s/gm, '• ');

  // Format bold text
  bodyContent = bodyContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Clean up whitespace and line breaks
  bodyContent = bodyContent
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();

  return { header, content: bodyContent };
};
