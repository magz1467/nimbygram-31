
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
      .replace(/[📝🏗️🏘️👷‍♂️👨‍👩‍👧‍👦📏\[\]{}()#*]/g, '') // Remove all emojis and formatting chars
      .replace(/^[📝🏗️🏘️👷‍♂️👨‍👩‍👧‍👦📏]/g, '') // Remove leading emojis
      .replace(/(?:What'?s the [Dd]eal:?|The Deal:?)\s*/g, '') // Remove "What's the Deal:" variations
      .trim();
    
    // Create regex patterns for different header variations
    const patterns = [
      // Full title with formatting
      new RegExp(`^\\s*${header.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'gmi'),
      // Title without emojis or formatting
      new RegExp(`^\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'gmi'),
      // Title with "What's the Deal:" prefix
      new RegExp(`^\\s*(?:What'?s the [Dd]eal:?|The Deal:?)\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'gmi'),
      // Title with markdown headers
      new RegExp(`^\\s*#{1,3}\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'gmi'),
      // Title with brackets or parentheses
      new RegExp(`^\\s*[\\[\\{\\(]\\s*${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*[\\]\\}\\)]\\s*`, 'gmi'),
      // Title with HTML-like tags
      new RegExp(`<[^>]*>${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}<\\/[^>]*>`, 'gmi'),
      // Title as a link
      new RegExp(`\\[.*?\\]\\(${baseHeader.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`, 'gmi')
    ];

    // Apply each pattern
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
  bodyContent = bodyContent.replace(/([A-Za-z\s]+:)(\s*)/g, '<strong>$1</strong>$2');

  // Clean up excess whitespace before processing line breaks
  bodyContent = bodyContent.replace(/\s+/g, ' ').trim();

  // Format paragraphs and line breaks
  bodyContent = bodyContent
    .split(/\n{2,}/)
    .map(para => para.trim())
    .filter(para => para)
    .map(para => `<p>${para}</p>`)
    .join('');

  // Handle single line breaks within paragraphs
  bodyContent = bodyContent.replace(/\n/g, '<br/>');

  // Ensure content is wrapped in paragraphs
  if (!bodyContent.startsWith('<p>')) {
    bodyContent = `<p>${bodyContent}</p>`;
  }

  return { header, content: bodyContent };
};
