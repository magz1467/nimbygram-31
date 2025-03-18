
import { FC } from "react";

interface WatchOutForSectionProps {
  content: string | string[];
}

export const WatchOutForSection: FC<WatchOutForSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process HTML content with more robust handling
  const processContent = (str: string) => {
    return str
      .replace(/^What to Watch Out For:?\s*/i, '') // Remove redundant title at start
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert encoded HTML tags
      .replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>'); // Convert markdown bold to HTML
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
      // Handle array content - create proper bullet points
      const validItems = inputContent.filter(item => item && !isEmptyContent(item));
      
      if (validItems.length === 0) return '';
      
      return `<ul class="list-disc pl-5 space-y-2 my-0">
        ${validItems.map(item => `<li class="pl-1 mb-2 text-left">${processContent(item)}</li>`).join('')}
      </ul>`;
    } else {
      // Handle string content
      let contentStr = processContent(inputContent);
      
      if (isEmptyContent(contentStr)) return '';
      
      // Make headers bold
      contentStr = contentStr.replace(
        /(The Details:|Details:|Considerations:|Key Considerations:)/gi,
        '<strong class="font-bold text-gray-800">$1</strong>'
      );
      
      // Check if content has bullet points and format properly
      if (contentStr.includes('•') || contentStr.includes('*') || contentStr.includes('-')) {
        const parts = contentStr.split(/(?:•|\*|-)\s+/).filter(Boolean);
        if (parts.length > 1) {
          return `<ul class="list-disc pl-5 space-y-2 my-0">
            ${parts.map(part => `<li class="pl-1 mb-2 text-left">${part.trim()}</li>`).join('')}
          </ul>`;
        }
      }
      
      // Add paragraph tags if not already present
      if (!contentStr.includes('<p>')) {
        contentStr = `<p class="my-0 mt-2 text-left">${contentStr}</p>`;
      }
      
      return contentStr;
    }
  };
  
  // If after processing we have no content, return null
  if ((typeof content === 'string' && isEmptyContent(content)) || 
      (Array.isArray(content) && content.every(isEmptyContent))) return null;
  
  const htmlContent = formatHtmlContent(content);
  if (!htmlContent) return null;
  
  return (
    <div className="bg-[#FFDEE2] text-gray-800 rounded-lg p-4">
      <h3 className="font-bold mb-2 text-base md:text-lg flex items-center gap-2 text-left">
        <span>👀</span> What to Watch Out For
      </h3>
      <div 
        className="space-y-2 text-gray-700 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
