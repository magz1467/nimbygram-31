
export const formatStorybook = (text: string): string => {
  if (!text) return '';

  // Split text into paragraphs
  const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p);
  
  return paragraphs.map(paragraph => {
    // Handle bullet points
    if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
      return '• ' + paragraph.substring(1).trim() + '\n';
    }
    
    // Handle header-like text (all caps sections)
    if (paragraph === paragraph.toUpperCase() && paragraph.length > 3) {
      return paragraph + '\n\n';
    }
    
    // Regular paragraphs
    return paragraph + '\n\n';
  }).join('').trim();
};

