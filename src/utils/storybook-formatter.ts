
export const formatStorybook = (content: string | null) => {
  if (!content) return null;

  // Extract header if it exists
  const headerMatch = content.match(/<header>(.*?)<\/header>/);
  const header = headerMatch ? headerMatch[1].trim() : null;
  
  // Get content without the header tags
  let bodyContent = content.replace(/<header>.*?<\/header>/g, '').trim();

  // Split content into paragraphs and process each one
  bodyContent = bodyContent
    .split(/\n\n+/)
    .map(paragraph => {
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
    .join('\n');

  // Clean up any empty paragraphs and excess whitespace
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

