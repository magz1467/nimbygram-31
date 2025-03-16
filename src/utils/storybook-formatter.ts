
export const formatStorybook = (content: string | null) => {
  if (!content) {
    console.log('No storybook content provided');
    return null;
  }

  // Enhanced logging to see what we're working with
  console.log('Processing storybook content type:', typeof content);
  console.log('Processing storybook content length:', content.length);
  console.log('Processing storybook content preview:', content.substring(0, 100) + '...');

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

  // Process sections
  const processedSections = [];
  
  // Check if content has "What's the Deal" section
  const dealMatch = bodyContent.match(/What['']s the Deal:?(.*?)(?=Key Details:|The Details:|Nimbywatch:|$)/si);
  if (dealMatch && dealMatch[1]) {
    processedSections.push({
      type: 'deal',
      title: "What's the Deal",
      content: dealMatch[1].trim()
    });
  }
  
  // Check if content has "Key Details" or "The Details" section
  const detailsMatch = bodyContent.match(/(?:Key Details:|The Details:)(.*?)(?=Nimbywatch:|Considerations:|$)/si);
  if (detailsMatch && detailsMatch[1]) {
    // Extract bullet points
    const detailsContent = detailsMatch[1].trim();
    const bulletPoints = detailsContent.split(/(?:•|\*|-)\s+/)
      .map(point => point.trim())
      .filter(point => point.length > 0);
    
    // If we extracted bullet points, use them; otherwise use the whole content
    if (bulletPoints.length > 0) {
      processedSections.push({
        type: 'details',
        title: "Key Details",
        content: bulletPoints
      });
    } else {
      processedSections.push({
        type: 'details',
        title: "Key Details",
        content: detailsContent
      });
    }
  }
  
  // Check if content has "Nimbywatch" section
  const nimbyMatch = bodyContent.match(/Nimbywatch:(.*?)(?=\n\n|$)/si);
  if (nimbyMatch && nimbyMatch[1]) {
    processedSections.push({
      type: 'nimby',
      title: "Nimbywatch",
      content: nimbyMatch[1].trim()
    });
  }
  
  // If no sections were found, provide the raw content as fallback
  if (processedSections.length === 0) {
    console.log('No structured sections found in storybook, using raw content as fallback');
    
    // Format the content for better display
    const cleanContent = bodyContent
      .split(/\n\n+/)
      .map(paragraph => {
        if (!paragraph.trim()) return '';
        
        // Format bullet points
        paragraph = paragraph.replace(/^\*\s|-\s/g, '• ');
        
        // Format bold text
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        return `<p>${paragraph}</p>`;
      })
      .filter(Boolean)
      .join('\n');

    return { 
      header, 
      content: cleanContent,
      rawContent: bodyContent // Include the raw content for fallback
    };
  }
  
  console.log(`Found ${processedSections.length} storybook sections:`, 
    processedSections.map(s => s.type).join(', '));
  
  return { 
    header, 
    sections: processedSections,
    rawContent: bodyContent // Include the raw content for fallback
  };
};
