
import { FC } from "react";

interface NimbySectionProps {
  content: string | string[];
}

export const NimbySection: FC<NimbySectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process HTML content
  const processContent = (str: string) => {
    // Clean up common prefix issues
    return str
      .replace(/^Nimbywatch:?\s*/i, '') // Remove redundant title at start
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>'); // Convert encoded HTML tags
  };
  
  // More robust empty content check
  const isEmptyContent = (str: string) => {
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };
  
  // Format the content with proper paragraphs and bullet points if needed
  const formatHtmlContent = (inputContent: string | string[]) => {
    if (Array.isArray(inputContent)) {
      // Handle array content
      return inputContent
        .filter(item => item && !isEmptyContent(item))
        .map((item, index) => `<p key="${index}">${processContent(item)}</p>`)
        .join('');
    } else {
      // Handle string content
      let contentStr = processContent(inputContent);
      
      // Check if content has bullet points and format properly
      if (contentStr.includes('•') || contentStr.includes('*') || contentStr.includes('-')) {
        const parts = contentStr.split(/(?:•|\*|-)\s+/).filter(Boolean);
        if (parts.length > 1) {
          return parts.map((part, i) => `<p key="${i}" class="${i > 0 ? 'mt-2' : ''}">${part.trim()}</p>`).join('');
        }
      }
      
      // Add paragraph tags if not already present
      if (!contentStr.includes('<p>')) {
        contentStr = `<p>${contentStr}</p>`;
      }
      
      return contentStr;
    }
  };
  
  // If after processing we have no content, return null
  if ((typeof content === 'string' && isEmptyContent(content)) || 
      (Array.isArray(content) && content.every(isEmptyContent))) return null;
  
  const htmlContent = formatHtmlContent(content);
  
  return (
    <div className="bg-[#8B5CF6] bg-opacity-10 rounded-lg p-4">
      <h3 className="font-semibold mb-2 text-[#8B5CF6] flex items-center gap-2">
        <span>🏘️</span> Nimbywatch
      </h3>
      <div 
        className="space-y-2 text-gray-700"
        dangerouslySetInnerHTML={{ 
          __html: htmlContent.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
        }}
      />
    </div>
  );
};
