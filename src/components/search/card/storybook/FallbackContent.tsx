
import { FC } from "react";

interface FallbackContentProps {
  content?: string | null;
  storybook?: string | null;
}

export const FallbackContent: FC<FallbackContentProps> = ({ content, storybook }) => {
  // Process HTML tags in content
  const processHtml = (str: string) => {
    return str
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert encoded HTML tags
      .replace(/\n\*\s*$/gm, '') // Remove empty bullet points
      .replace(/\n\*\s*\n/g, '\n') // Remove empty bullet points with newlines
      .replace(/\n\s*•\s*\n/g, '\n') // Remove empty bullet points with bullets
      .replace(/\n\s*-\s*\n/g, '\n') // Remove empty bullet points with dashes
      .replace(/\*\*/g, ''); // Remove ** markers completely
  };

  // More robust empty content check
  const isEmptyContent = (str: string) => {
    if (!str) return true;
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };

  // Function to format bullet points properly with improved mobile support
  const formatBulletPoints = (text: string) => {
    // Clean up any standalone markers first
    const cleanedText = text
      .replace(/^\s*[\*•-]\s*$/gm, '') // Remove empty bullet points
      .replace(/\n\s*[\*•-]\s*\n/g, '\n'); // Remove empty bullets with newlines
      
    // Check if text contains bullet points
    if (cleanedText.includes('• ') || cleanedText.includes('* ') || cleanedText.includes('- ')) {
      // Extract bullet points with regex
      const bulletRegex = /(?:^|\n)\s*([•\*\-])\s+(.*?)(?=(?:^|\n)\s*[•\*\-]|$)/gs;
      const bulletMatches = [...cleanedText.matchAll(bulletRegex)];
      
      if (bulletMatches.length > 0) {
        let formattedHtml = `<ul class="list-disc pl-5 space-y-1">`;
        bulletMatches.forEach(match => {
          const bulletText = match[2].trim();
          if (bulletText) { // Only add if there's content
            formattedHtml += `<li class="pl-0 mb-1 relative">${bulletText}</li>`;
          }
        });
        formattedHtml += `</ul>`;
        
        // Get any content before the first bullet point
        const firstBulletStart = cleanedText.indexOf(bulletMatches[0][0]);
        if (firstBulletStart > 0) {
          const beforeBullets = cleanedText.substring(0, firstBulletStart).trim();
          if (beforeBullets) {
            formattedHtml = `<p>${beforeBullets}</p>${formattedHtml}`;
          }
        }
        
        return formattedHtml;
      }
    }
    
    return `<p>${cleanedText}</p>`;
  };

  // First try to use formatted content if available
  if (content && !isEmptyContent(content)) {
    const processedContent = processHtml(content);
    return (
      <div className="prose prose-sm max-w-none" 
        dangerouslySetInnerHTML={{ __html: formatBulletPoints(processedContent) }} 
      />
    );
  }
  
  // Raw fallback if nothing was processed correctly
  if (storybook && !isEmptyContent(storybook)) {
    const processedStorybook = processHtml(storybook);
    
    // Try to identify bullet points and format them properly
    const formattedContent = formatBulletPoints(processedStorybook);
    
    return (
      <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
        <h3 className="text-gray-900 font-medium mb-2">Application Details</h3>
        <div 
          className="whitespace-pre-wrap text-gray-700"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>
    );
  }
  
  return null;
};
