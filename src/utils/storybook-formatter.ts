
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

  // Format section headers (like "The Details:", "What's next:")
  bodyContent = bodyContent.replace(/([A-Za-z\s]+:)(\s*)/g, '<strong>$1</strong>$2');

  // Add spacing after section headers and between paragraphs
  bodyContent = bodyContent
    .replace(/<\/strong>\s*/g, '</strong><br/>')
    .replace(/\n{3,}/g, '\n\n')  // Replace multiple line breaks with double line break
    .replace(/\n/g, '<br/>')     // Convert remaining line breaks to <br/>
    .replace(/<br\/><br\/>/g, '</p><p>') // Convert double breaks to paragraphs
    .replace(/^\s+|\s+$/gm, '')  // Trim whitespace from start/end of lines
    .trim();

  // Wrap content in paragraphs if not already wrapped
  if (!bodyContent.startsWith('<p>')) {
    bodyContent = `<p>${bodyContent}</p>`;
  }

  return { header, content: bodyContent };
};

