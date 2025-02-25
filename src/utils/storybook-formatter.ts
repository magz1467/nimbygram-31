
export const formatStorybook = (content: string | null) => {
  if (!content) return null;

  // Extract header if it exists
  const headerMatch = content.match(/<header>(.*?)<\/header>/);
  const header = headerMatch ? headerMatch[1].trim() : null;
  
  // Get content without the header tags
  let bodyContent = content.replace(/<header>.*?<\/header>/g, '').trim();
  
  // If there's a header, remove it and any variations from the content
  if (header) {
    // Create a base version of the header by removing formatting
    const baseHeader = header.replace(/\[|\]|\{|\}|\(|\)|#|\*/g, '').trim();
    
    // Create an array of possible header variations to remove
    const headerVariations = [
      header,
      `[${header}]`,
      `[${baseHeader}]`,
      `What's the Deal: ${header}`,
      `What's the deal: ${header}`,
      `Whats the Deal: ${header}`,
      `Whats the deal: ${header}`,
      baseHeader,
      // Add color-formatted versions
      `\\[.*?\\]\\(${baseHeader}\\)`,
      // Add markdown-style headers
      `#\\s*${baseHeader}`,
      `##\\s*${baseHeader}`,
      // Add any HTML-like formatting
      `<[^>]*>${baseHeader}<\\/[^>]*>`,
    ];

    // Remove each variation from the start of the content
    headerVariations.forEach(variant => {
      if (!variant) return;
      try {
        // Create a case-insensitive regex that matches the variant at the start or anywhere in the text
        const regex = new RegExp(`(^\\s*|\\n\\s*)${variant.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'gi');
        bodyContent = bodyContent.replace(regex, '');
      } catch (e) {
        console.error('Error with regex:', e);
      }
    });
  }

  // Remove any remaining markdown heading indicators
  bodyContent = bodyContent.replace(/^##?\s*/gm, '');

  // Convert asterisk list items to bullet points
  bodyContent = bodyContent.replace(/^\*\s/gm, '• ');

  // Format bold text
  bodyContent = bodyContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Clean up any double line breaks or extra whitespace
  bodyContent = bodyContent
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { header, content: bodyContent };
};
