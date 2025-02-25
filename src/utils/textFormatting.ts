
export const formatStorybook = (text: string): string => {
  console.log('🔤 Formatting text:', {
    input: text,
    type: typeof text,
    length: text?.length,
    preview: text?.substring(0, 100)
  });

  if (!text) {
    console.log('⚠️ Empty text received in formatStorybook');
    return '';
  }

  // Split text into paragraphs
  const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p);
  console.log('📝 Processed paragraphs:', {
    count: paragraphs.length,
    firstParagraph: paragraphs[0]
  });
  
  const formatted = paragraphs.map(paragraph => {
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

  console.log('✨ Formatted output:', {
    length: formatted.length,
    preview: formatted.substring(0, 100)
  });

  return formatted;
};
