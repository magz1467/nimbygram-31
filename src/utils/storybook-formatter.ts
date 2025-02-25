
export const formatStorybook = (content: string | null) => {
  if (!content) return null;

  // Extract header if it exists
  const headerMatch = content.match(/<header>(.*?)<\/header>/);
  const header = headerMatch ? headerMatch[1].trim() : null;
  
  // Get content without the header tags
  let bodyContent = content.replace(/<header>.*?<\/header>/g, '').trim();

  if (header) {
    // Create a sanitized version of the header for comparison
    const sanitizedHeader = header
      .replace(/[^\w\s]/g, '') // Remove special characters
      .toLowerCase()
      .trim();

    // Get the first paragraph of content
    const firstParagraph = bodyContent.split(/\n\n/)[0];
    const sanitizedFirstParagraph = firstParagraph
      .replace(/[^\w\s]/g, '')
      .toLowerCase()
      .trim();

    // If the first paragraph is similar to the header, remove it
    if (sanitizedFirstParagraph.includes(sanitizedHeader) ||
        sanitizedHeader.includes(sanitizedFirstParagraph)) {
      bodyContent = bodyContent
        .replace(firstParagraph, '')
        .trim();
    }
  }

  // Split content into paragraphs and process each one
  bodyContent = bodyContent
    .split(/\n\n+/)
    .map(paragraph => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return '';

      const lines = paragraph
        .trim()
        .split('\n')
        .map(line => {
          // Convert asterisk list items to bullet points
          line = line.replace(/^\*\s/, '• ');
          
          // Format bold text
          line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          // Format section headers that appear at start of lines
          line = line.replace(/^([A-Za-z\s']+:)(\s*)/g, '<strong>$1</strong>$2');
          
          return line;
        })
        .join('<br/>');

      return `<p>${lines}</p>`;
    })
    .filter(Boolean) // Remove empty paragraphs
    .join('\n');

  // Clean up any excess whitespace and empty paragraphs
  bodyContent = bodyContent
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure content is wrapped in paragraphs
  if (!bodyContent.startsWith('<p>')) {
    bodyContent = `<p>${bodyContent}</p>`;
  }

  return { header, content: bodyContent };
};

