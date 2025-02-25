
export const formatStorybook = (content: string | null) => {
  if (!content) return null;

  // Extract header if it exists
  const headerMatch = content.match(/<header>(.*?)<\/header>/);
  const header = headerMatch ? headerMatch[1].trim() : null;
  
  // Get content without the header tags
  let bodyContent = content.replace(/<header>.*?<\/header>/g, '').trim();
  
  // If there's a header, remove all variations of it from the beginning of the content
  if (header) {
    // Create a base version of the header by removing all formatting
    const baseHeader = header
      .replace(/[📝🏗️🏘️👷‍♂️👨‍👩‍👧‍👦📏\[\]{}()#*]/g, '') // Remove all emojis and formatting chars
      .replace(/^[📝🏗️🏘️👷‍♂️👨‍👩‍👧‍👦📏]/g, '') // Remove leading emojis
      .replace(/(?:What'?s the [Dd]eal:?|The Deal:?)\s*/g, '') // Remove "What's the Deal:" variations
      .trim();
    
    // Create regex patterns for different header variations
    const patterns = [
      new RegExp(`^\\s*${header.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'mi'),
      new RegExp(`^\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'mi'),
      new RegExp(`^\\s*(?:What'?s the [Dd]eal:?|The Deal:?)\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'mi'),
      new RegExp(`^\\s*#{1,3}\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'mi'),
      new RegExp(`^\\s*[\\[\\{\\(]\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*[\\]\\}\\)]\\s*`, 'mi')
    ];

    // Apply each pattern to remove header variations from the start of content
    patterns.forEach(pattern => {
      bodyContent = bodyContent.replace(pattern, '');
    });
  }

  // Remove any remaining markdown headers
  bodyContent = bodyContent.replace(/^#{1,3}\s+/gm, '');

  // Convert asterisk list items to bullet points
  bodyContent = bodyContent.replace(/^\*\s/gm, '• ');

  // Format bold text
  bodyContent = bodyContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Format section headers (like "The Details:", "What's next:")
  bodyContent = bodyContent.replace(/^([A-Za-z\s']+:)(\s*)/gm, '<strong>$1</strong>$2');

  // Preserve line breaks and handle paragraphs
  bodyContent = bodyContent
    .split(/\n\n+/) // Split on multiple newlines
    .map(para => {
      // Handle line breaks within paragraphs
      const formattedPara = para
        .trim()
        .replace(/\n/g, '<br/>');
      return `<p>${formattedPara}</p>`;
    })
    .join('\n');

  // Clean up any empty paragraphs
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

