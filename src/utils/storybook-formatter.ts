
export const formatStorybook = (content: string | null) => {
  if (!content) {
    console.log('No storybook content provided');
    return null;
  }

  // Enhanced logging to see what we're working with
  console.log('Processing storybook content type:', typeof content);
  console.log('Processing storybook content length:', content.length);
  console.log('Processing storybook content preview:', content.substring(0, 100) + '...');

  // Handle potential string/JSON parsing issues
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

  // Clean up formatting issues
  processedContent = processedContent
    // Remove standalone asterisks that appear as bullets
    .replace(/\n\s*\*\s*\n/g, '\n') // Remove asterisks on their own line
    .replace(/^\s*\*\s*$/gm, '') // Remove standalone asterisks at start of lines
    .replace(/\n\s*•\s*\n/g, '\n') // Remove empty bullet points with bullet character
    .replace(/\n\s*-\s*\n/g, '\n') // Remove empty bullet points with dash
    .replace(/\n\s*\*\s*$/gm, '') // Remove trailing asterisks with no content
    .replace(/\n\s*•\s*$/gm, '') // Remove trailing bullet points with no content
    .replace(/\n\s*-\s*$/gm, '') // Remove trailing dashes with no content
    .replace(/\n\s*[\*•-]\s+\n/g, '\n') // Handle bullet points with only whitespace after them
    // Process HTML tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert HTML entities to HTML tags
    .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>'); // Ensure strong tags are processed

  // Format headers with proper styling
  processedContent = processedContent
    .replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>'); // Bold headers with **Text:**

  // Extract header if it exists
  const headerMatch = processedContent.match(/<header>(.*?)<\/header>/s) || 
                     processedContent.match(/^# (.*?)(\n|$)/m) ||
                     processedContent.match(/^Title: (.*?)(\n|$)/mi);
  
  const header = headerMatch ? headerMatch[1].trim() : null;
  
  // Get content without the header tags
  let bodyContent = processedContent
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

  // Process sections
  const processedSections = [];
  
  // Check if content has "What's the Deal" section
  const dealMatch = bodyContent.match(/What['']s the Deal:?(.*?)(?=Key Details:|The Details:|Nimbywatch:|What to Watch Out For:|Key Regulations:|$)/si);
  if (dealMatch && dealMatch[1]) {
    processedSections.push({
      type: 'deal',
      title: "What's the Deal",
      content: dealMatch[1].trim()
    });
  }
  
  // Extract and properly format bullet points in the Key Details section
  const detailsMatch = bodyContent.match(/(?:Key Details:|The Details:)(.*?)(?=Nimbywatch:|What to Watch Out For:|Key Regulations:|Considerations:|$)/si);
  if (detailsMatch && detailsMatch[1]) {
    // Strip the content and identify bullet points properly
    const detailsContent = detailsMatch[1].trim();
    
    // First, look for explicit bullet points (•, *, -, or emoji followed by space)
    let bulletPoints = [];
    const bulletPattern = /(?:^|\n)[\s]*(?:[•\*\-]|🏠|🔍|🏢|✏️|📝|🔑|📃|🔨|🚧|🔔|⚙️|🔧|📈|📊|📋|📑|✅|❌|⚠️|🚫|👀)[\s]+(.*?)(?=(?:^|\n)[\s]*(?:[•\*\-]|🏠|🔍|🏢|✏️|📝|🔑|📃|🔨|🚧|🔔|⚙️|🔧|📈|📊|📋|📑|✅|❌|⚠️|🚫|👀)[\s]+|$)/gs;
    const matches = [...detailsContent.matchAll(bulletPattern)];
    
    if (matches.length > 0) {
      // We have proper bullet points
      bulletPoints = matches.map(match => match[1].trim()).filter(Boolean);
    } else {
      // Try to split by newlines and look for patterns that suggest bullet points
      const lines = detailsContent.split(/\n/).map(line => line.trim()).filter(Boolean);
      
      // Check if most lines have similar prefixes or patterns
      const similarPrefixes = lines.filter(line => 
        line.match(/^[🏠🔍🏢✏️📝🔑📃🔨🚧🔔⚙️🔧📈📊📋📑✅❌⚠️🚫👀]/) ||
        line.match(/^[A-Z][a-z]+ [a-z]+:/) ||
        line.match(/^The [a-z]+/)
      ).length > lines.length / 2;
      
      if (similarPrefixes) {
        // These look like they should be bullet points
        bulletPoints = lines;
      } else {
        // Just use the whole content if we can't identify clear bullets
        bulletPoints = [detailsContent];
      }
    }
    
    // Filter out any empty bullet points and clean them up
    bulletPoints = bulletPoints
      .filter(point => {
        if (!point) return false;
        // Remove bullet markers at the start of each line 
        const cleanPoint = point.replace(/^[\s]*[•\*\-][\s]*/, '').trim();
        return cleanPoint.length > 0;
      })
      .map(point => {
        // Clean up each bullet point - remove any leading bullet markers
        return point.replace(/^[\s]*[•\*\-][\s]*/, '').trim();
      });
    
    // Add to processed sections
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
  const nimbyMatch = bodyContent.match(/Nimbywatch:?(.*?)(?=What to Watch Out For:|Key Regulations:|$)/si);
  if (nimbyMatch && nimbyMatch[1]) {
    processedSections.push({
      type: 'nimby',
      title: "Nimbywatch",
      content: nimbyMatch[1].trim()
    });
  }

  // Check if content has "What to Watch Out For" section
  const watchOutForMatch = bodyContent.match(/What to Watch Out For:?(.*?)(?=Nimbywatch:|Key Regulations:|$)/si);
  if (watchOutForMatch && watchOutForMatch[1]) {
    processedSections.push({
      type: 'watchOutFor',
      title: "What to Watch Out For",
      content: watchOutForMatch[1].trim()
    });
  }

  // Check if content has "Key Regulations" section
  const keyRegulationsMatch = bodyContent.match(/Key Regulations:?(.*?)(?=Nimbywatch:|What to Watch Out For:|$)/si);
  if (keyRegulationsMatch && keyRegulationsMatch[1]) {
    processedSections.push({
      type: 'keyRegulations',
      title: "Key Regulations",
      content: keyRegulationsMatch[1].trim()
    });
  }
  
  // Look for emoji markers that indicate special sections
  const findEmojiSections = (text, emojiPattern, sectionType, sectionTitle) => {
    const regex = new RegExp(`(${emojiPattern})\\s*${sectionTitle}[:\\s]+(.*?)(?=(?:${emojiPattern})|$)`, 'gi');
    const matches = [...text.matchAll(regex)];
    if (matches.length > 0) {
      matches.forEach(match => {
        const content = match[2].trim();
        if (content) {
          processedSections.push({
            type: sectionType,
            title: sectionTitle,
            content: content
          });
        }
      });
    }
  };

  // Look for Watch Out For sections with emoji indicators
  findEmojiSections(bodyContent, '[👀🚫⚠️]', 'watchOutFor', 'What to Watch Out For');
  
  // Look for Key Regulations sections with emoji indicators
  findEmojiSections(bodyContent, '[📝📃📜]', 'keyRegulations', 'Key Regulations');
  
  // Look for Nimbywatch sections with emoji indicators
  findEmojiSections(bodyContent, '[🏠🏘️🏡]', 'nimby', 'Nimbywatch');
  
  // If no sections were found, provide the raw content as fallback
  if (processedSections.length === 0) {
    console.log('No structured sections found in storybook, using raw content as fallback');
    
    // Format the content for better display
    const cleanContent = bodyContent
      .split(/\n\n+/)
      .map(paragraph => {
        if (!paragraph.trim()) return '';
        
        // Format bullet points
        paragraph = paragraph.replace(/^\*\s|-\s|•\s/g, '• ');
        
        // Format bold text
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        return `<p>${paragraph}</p>`;
      })
      .filter(Boolean)
      .join('\n');

    // Check if we actually have content
    if (cleanContent) {
      return { 
        header: header || 'Planning Application', 
        content: cleanContent,
        rawContent: bodyContent // Include the raw content for fallback
      };
    }
  } else {
    console.log(`Found ${processedSections.length} storybook sections:`, 
      processedSections.map(s => s.type).join(', '));
    
    return { 
      header: header || processedSections[0]?.title || 'Planning Application', 
      sections: processedSections,
      rawContent: bodyContent // Include the raw content for fallback
    };
  }
  
  // If we've reached here, we couldn't parse the content effectively
  // Return a basic object with the original content
  return {
    header: header || 'Planning Application',
    content: `<p>${bodyContent}</p>`,
    rawContent: bodyContent
  };
};
