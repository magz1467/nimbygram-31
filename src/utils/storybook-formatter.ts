
export const formatStorybook = (content: string | null) => {
  if (!content) return null;

  // Extract header if it exists
  const headerMatch = content.match(/<header>(.*?)<\/header>/);
  const header = headerMatch ? headerMatch[1].trim() : null;
  
  // Get content without the header tags
  let bodyContent = content.replace(/<header>.*?<\/header>/g, '').trim();
  
  // If there's a header, remove it and any variations from the content
  if (header) {
    // Create an array of possible header variations to remove
    const headerVariations = [
      header,
      `[${header}]`,
      `What's the Deal: ${header}`,
      `What's the deal: ${header}`,
      `Whats the Deal: ${header}`,
      `Whats the deal: ${header}`,
      header.replace(/[\[\]]/g, ''), // Remove any brackets from header
    ];

    // Remove each variation from the start of the content
    headerVariations.forEach(variant => {
      if (!variant) return;
      // Create a case-insensitive regex that matches the variant at the start
      const regex = new RegExp(`^\\s*${variant.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'i');
      bodyContent = bodyContent.replace(regex, '');
    });
  }

  // Remove markdown heading indicators (##)
  bodyContent = bodyContent.replace(/^##\s*/gm, '');

  // Convert asterisk list items to bullet points
  bodyContent = bodyContent.replace(/^\*\s/gm, '• ');

  // Format bold text
  const formattedContent = bodyContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return { header, content: formattedContent.trim() };
};
