
export const formatStorybook = (text: string): string => {
  if (!text) return '';

  // Split text into lines
  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    // Convert bullet points
    line = line.replace(/^[-*]\s+/g, '• ');
    
    // Add spacing after bullet points
    if (line.startsWith('•')) {
      line = line + '\n';
    }
    
    // Add spacing after periods that end sentences
    line = line.replace(/\.\s+/g, '.\n\n');
    
    return line;
  });

  return formattedLines.join('\n').trim();
};
