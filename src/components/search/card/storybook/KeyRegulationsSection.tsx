
import { FC } from "react";

interface KeyRegulationsSectionProps {
  content: string | string[];
}

export const KeyRegulationsSection: FC<KeyRegulationsSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process HTML content
  const processContent = (str: string) => {
    // Clean up common prefix issues
    return str
      .replace(/^Key Regulations:?\s*/i, '') // Remove redundant title at start
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
      // Handle array content - create proper bullet points
      return `<ul class="list-disc pl-5 space-y-2 my-0 text-left">
        ${inputContent
          .filter(item => item && !isEmptyContent(item))
          .map((item, index) => `<li class="pl-1 mb-2 text-left">${processContent(item)}</li>`)
          .join('')}
      </ul>`;
    } else {
      // Handle string content
      let contentStr = processContent(inputContent);
      
      // Check if content has bullet points and format properly
      if (contentStr.includes('•') || contentStr.includes('*') || contentStr.includes('-')) {
        const parts = contentStr.split(/(?:•|\*|-)\s+/).filter(Boolean);
        if (parts.length > 1) {
          return `<ul class="list-disc pl-5 space-y-2 my-0 text-left">
            ${parts.map((part, i) => `<li class="pl-1 mb-2 text-left">${part.trim()}</li>`).join('')}
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
  
  return (
    <div className="bg-[#F2FCE2] text-gray-800 rounded-lg p-4">
      <h3 className="font-semibold mb-2 text-base md:text-lg flex items-center gap-2 text-left">
        <span>📃</span> Key Regulations
      </h3>
      <div 
        className="space-y-2 text-gray-700 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: htmlContent.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
        }}
      />
    </div>
  );
};
