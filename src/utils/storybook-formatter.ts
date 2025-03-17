
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

  // Clean up formatting issues - improved version
  processedContent = processedContent
    // Normalize section headers (add colon if missing)
    .replace(/What['']s the Deal(?!\:)/gi, "What's the Deal:")
    .replace(/Key Details(?!\:)/gi, "Key Details:")
    .replace(/What to Watch Out For(?!\:)/gi, "What to Watch Out For:")
    .replace(/Nimbywatch(?!\:)/gi, "Nimbywatch:")
    .replace(/Key Regulations(?!\:)/gi, "Key Regulations:")
    // Ensure sections have proper spacing
    .replace(/(What['']s the Deal:)/gi, "\n$1")
    .replace(/(Key Details:)/gi, "\n$1")
    .replace(/(What to Watch Out For:)/gi, "\n$1")
    .replace(/(Nimbywatch:)/gi, "\n$1")
    .replace(/(Key Regulations:)/gi, "\n$1")
    // Remove standalone asterisks that appear as bullets
    .replace(/\n\s*\*\s*\n/g, '\n') // Remove asterisks on their own line
    .replace(/^\s*\*\s*$/gm, '') // Remove standalone asterisks at start of lines
    .replace(/\n\s*•\s*\n/g, '\n') // Remove empty bullet points with bullet character
    .replace(/\n\s*-\s*\n/g, '\n') // Remove empty bullet points with dash
    .replace(/\n\s*\*\s*$/gm, '') // Remove trailing asterisks with no content
    .replace(/\n\s*•\s*$/gm, '') // Remove trailing bullet points with no content
    .replace(/\n\s*-\s*$/gm, '') // Remove trailing dashes with no content
    .replace(/\n\s*[\*•-]\s+\n/g, '\n') // Handle bullet points with only whitespace after them
    // Normalize double asterisks for formatting
    .replace(/\*\*/g, '') // Remove double asterisks completely
    // Process HTML tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert HTML entities to HTML tags
    .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>'); // Ensure strong tags are processed

  // Normalize bullet points with emojis - make sure emoji is part of the bullet content
  processedContent = processedContent.replace(
    /(\n\s*[•\*\-]\s*)([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}✓])/gu, 
    '$1$2 '
  );

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

  // Process sections with better section boundary detection
  const processedSections = [];
  
  // Use a more robust pattern to match section titles with their content
  const sectionPattern = /(?:^|\n)(What['']s the Deal:|Key Details:|Nimbywatch:|What to Watch Out For:|Key Regulations:)(.*?)(?=(?:^|\n)(?:What['']s the Deal:|Key Details:|Nimbywatch:|What to Watch Out For:|Key Regulations:)|$)/gis;
  
  const sectionMatches = [...bodyContent.matchAll(sectionPattern)];
  
  if (sectionMatches.length > 0) {
    sectionMatches.forEach(match => {
      const sectionTitle = match[1].trim();
      let sectionContent = match[2].trim();
      
      // Skip if section content is empty
      if (!sectionContent) return;
      
      // Determine section type
      let sectionType = '';
      if (/What['']s the Deal:/i.test(sectionTitle)) {
        sectionType = 'deal';
      } else if (/Key Details:/i.test(sectionTitle)) {
        sectionType = 'details';
      } else if (/Nimbywatch:/i.test(sectionTitle)) {
        sectionType = 'nimby';
      } else if (/What to Watch Out For:/i.test(sectionTitle)) {
        sectionType = 'watchOutFor';
      } else if (/Key Regulations:/i.test(sectionTitle)) {
        sectionType = 'keyRegulations';
      }
      
      // Clean bullet points and prepare content
      sectionContent = sectionContent
        .replace(/^\s*[\*•-]\s*$/gm, '') // Remove empty bullet points
        .replace(/\n\s*[\*•-]\s*\n/g, '\n') // Remove empty bullets with newlines
        .replace(/\n{3,}/g, '\n\n'); // Normalize excessive newlines
      
      // Extract bullet points if any
      const hasBulletPoints = sectionContent.match(/(?:^|\n)\s*[•\*\-✓🔍🏠🏢]/m);
      
      // Process details section for bullet points
      if (sectionType === 'details' && hasBulletPoints) {
        // Extract bullet points
        const bulletPoints = [];
        const bulletRegex = /(?:^|\n)\s*([•\*\-✓🔍🏠🏢])\s+(.*?)(?=(?:^|\n)\s*[•\*\-✓🔍🏠🏢]|$)/gs;
        const bulletMatches = [...sectionContent.matchAll(bulletRegex)];
        
        bulletMatches.forEach(bulletMatch => {
          const text = bulletMatch[2].trim();
          if (text) { // Only add if there's actual content
            bulletPoints.push(text);
          }
        });
        
        if (bulletPoints.length > 0) {
          // Check for content before the first bullet point
          const firstBulletStart = sectionContent.indexOf(bulletMatches[0][0]);
          let introText = '';
          
          if (firstBulletStart > 0) {
            introText = sectionContent.substring(0, firstBulletStart).trim();
          }
          
          // If there's intro text, add it as a separate bullet point
          if (introText) {
            bulletPoints.unshift(introText);
          }
          
          processedSections.push({
            type: sectionType,
            title: sectionTitle.replace(/:$/, ''),
            content: bulletPoints
          });
          return;
        }
      }
      
      // Add the section
      processedSections.push({
        type: sectionType,
        title: sectionTitle.replace(/:$/, ''),
        content: sectionContent
      });
    });
  }
  
  // If no clear sections were found, try looking for emoji markers
  if (processedSections.length === 0) {
    // Try to automatically detect sections by looking for bullet patterns
    const paragraphs = bodyContent.split(/\n\n+/);
    let currentSection = '';
    let currentContent = '';
    
    for (const paragraph of paragraphs) {
      // Check if this paragraph looks like a section header
      if (paragraph.toLowerCase().includes("what's the deal") || 
          paragraph.toLowerCase().includes("key details") ||
          paragraph.toLowerCase().includes("nimbywatch") ||
          paragraph.toLowerCase().includes("what to watch out for") ||
          paragraph.toLowerCase().includes("key regulations")) {
        
        // If we have accumulated content from a previous section, save it
        if (currentSection && currentContent) {
          let sectionType = '';
          if (currentSection.toLowerCase().includes("what's the deal")) {
            sectionType = 'deal';
          } else if (currentSection.toLowerCase().includes("key details")) {
            sectionType = 'details';
          } else if (currentSection.toLowerCase().includes("nimbywatch")) {
            sectionType = 'nimby';
          } else if (currentSection.toLowerCase().includes("watch out for")) {
            sectionType = 'watchOutFor';
          } else if (currentSection.toLowerCase().includes("key regulations")) {
            sectionType = 'keyRegulations';
          }
          
          if (sectionType) {
            processedSections.push({
              type: sectionType,
              title: currentSection,
              content: currentContent.trim()
            });
          }
        }
        
        // Set up the new section
        currentSection = paragraph;
        currentContent = '';
      } else {
        // This is content for the current section
        currentContent += paragraph + '\n\n';
      }
    }
    
    // Don't forget to add the last section
    if (currentSection && currentContent) {
      let sectionType = '';
      if (currentSection.toLowerCase().includes("what's the deal")) {
        sectionType = 'deal';
      } else if (currentSection.toLowerCase().includes("key details")) {
        sectionType = 'details';
      } else if (currentSection.toLowerCase().includes("nimbywatch")) {
        sectionType = 'nimby';
      } else if (currentSection.toLowerCase().includes("watch out for")) {
        sectionType = 'watchOutFor';
      } else if (currentSection.toLowerCase().includes("key regulations")) {
        sectionType = 'keyRegulations';
      }
      
      if (sectionType) {
        processedSections.push({
          type: sectionType,
          title: currentSection,
          content: currentContent.trim()
        });
      }
    }
  }
  
  // If we still don't have clear sections, try to extract content based on bullet points
  if (processedSections.length === 0) {
    // Check if there are bullet points in the content
    const hasBulletPoints = bodyContent.match(/(?:^|\n)\s*[•\*\-✓🔍🏠🏢]/m);
    
    if (hasBulletPoints) {
      // Assume the content before the first bullet is the "What's the Deal" section
      const firstBulletMatch = bodyContent.match(/(?:^|\n)\s*[•\*\-✓🔍🏠🏢]/m);
      if (firstBulletMatch && firstBulletMatch.index > 0) {
        const dealContent = bodyContent.substring(0, firstBulletMatch.index).trim();
        if (dealContent) {
          processedSections.push({
            type: 'deal',
            title: "What's the Deal",
            content: dealContent
          });
        }
        
        // Assume the bullet points are "Key Details"
        const detailsContent = bodyContent.substring(firstBulletMatch.index).trim();
        if (detailsContent) {
          // Extract the bullet points
          const bulletPoints = [];
          const bulletRegex = /(?:^|\n)\s*([•\*\-✓🔍🏠🏢])\s+(.*?)(?=(?:^|\n)\s*[•\*\-✓🔍🏠🏢]|$)/gs;
          const bulletMatches = [...detailsContent.matchAll(bulletRegex)];
          
          bulletMatches.forEach(bulletMatch => {
            const text = bulletMatch[2].trim();
            if (text) {
              bulletPoints.push(text);
            }
          });
          
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
      } else {
        // If the content starts with bullets, treat it all as key details
        processedSections.push({
          type: 'details',
          title: "Key Details",
          content: bodyContent
        });
      }
    }
  }
  
  // If we still don't have sections, split the content into "What's the Deal" and "Key Details"
  if (processedSections.length === 0) {
    // Try to find key phrases to split content
    const dealMatch = bodyContent.match(/.*?(?=(?:Key Details:|$))/s);
    if (dealMatch && dealMatch[0].trim()) {
      processedSections.push({
        type: 'deal',
        title: "What's the Deal",
        content: dealMatch[0].trim()
      });
      
      // Look for key details after the deal section
      const detailsMatch = bodyContent.substring(dealMatch[0].length).match(/Key Details:(.*?)(?=(?:What to Watch Out For:|Nimbywatch:|$))/s);
      if (detailsMatch && detailsMatch[1].trim()) {
        processedSections.push({
          type: 'details',
          title: "Key Details",
          content: detailsMatch[1].trim()
        });
      }
    } else {
      // If no clear structure, just treat it all as the "deal" section
      // Clean up bullet points first
      const cleanedContent = bodyContent
        .replace(/^\s*[\*•-]\s*$/gm, '') // Remove empty bullet points
        .replace(/\n\s*[\*•-]\s*\n/g, '\n') // Remove empty bullets with newlines
        .replace(/\n{3,}/g, '\n\n'); // Normalize excessive newlines
      
      processedSections.push({
        type: 'deal',
        title: "What's the Deal",
        content: cleanedContent
      });
    }
  }
  
  // If we have sections, return them structured
  if (processedSections.length > 0) {
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
