import React from 'react';

/**
 * Formats content with bullet points into proper HTML structure
 */
export const formatContentWithBullets = (content: string) => {
  if (!content) return null;
  
  // If the content already has HTML formatting, return it as is
  if (content.includes('<ul>') || content.includes('<li>')) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }
  
  // Otherwise, split by bullet points and format
  const lines = content.split('\n');
  const formattedContent = [];
  let currentList = [];
  let key = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for various bullet point formats including emojis
    if (line.startsWith('•') || line.startsWith('*') || 
        /^[\u2022\u2023\u25E6\u2043\u2219\u25D8\u25CB\u25A0\u25A1\u25AA\u25AB]/.test(line) ||
        /^[\uD83C-\uDBFF\uDC00-\uDFFF]/.test(line) || // Emoji check
        /^[🏠🔍📋📝🏢🏗️🚧🔨🔧📊📈📉📌📍🗺️🗓️📅]/.test(line)) { // Common emoji bullets
      
      // Add to current bullet list - handle emoji by not trimming the first character
      const content = line.match(/^[\uD83C-\uDBFF\uDC00-\uDFFF]/) || 
                     /^[🏠🔍📋📝🏢🏗️🚧🔨🔧📊📈📉📌📍🗺️🗓️📅]/.test(line) 
                     ? line : line.substring(1).trim();
                     
      currentList.push(
        <li key={`list-item-${key++}`}>{content}</li>
      );
    } else if (line) {
      // If we have bullet points collected, add the list first
      if (currentList.length > 0) {
        formattedContent.push(
          <ul key={`list-${key++}`} className="bullet-list">{currentList}</ul>
        );
        currentList = [];
      }
      
      // Add the paragraph
      formattedContent.push(<p key={`para-${key++}`}>{line}</p>);
    }
  }
  
  // Don't forget to add any remaining list items
  if (currentList.length > 0) {
    formattedContent.push(
      <ul key={`list-${key++}`} className="bullet-list">{currentList}</ul>
    );
  }
  
  return <div className="formatted-content">{formattedContent}</div>;
}; 