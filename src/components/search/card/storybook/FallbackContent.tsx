
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
      .replace(/\n\s*-\s*\n/g, '\n'); // Remove empty bullet points with dashes
  };

  // More robust empty content check
  const isEmptyContent = (str: string) => {
    if (!str) return true;
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };

  // Function to format bullet points properly
  const formatBulletPoints = (text: string) => {
    // Check if text contains bullet points
    if (text.includes('• ') || text.includes('* ') || text.includes('- ')) {
      // Split by bullet point markers
      const parts = text.split(/(?:\n|^)(?:\s*[•*-]\s+)/).filter(Boolean);
      if (parts.length > 1) {
        return `<ul class="list-disc pl-5 space-y-2">
          ${parts.map(part => `<li>${part.trim()}</li>`).join('')}
        </ul>`;
      }
    }
    return `<p>${text}</p>`;
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
