
import { FC } from "react";

interface WatchOutForSectionProps {
  content: string | string[];
}

export const WatchOutForSection: FC<WatchOutForSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process content with improved formatting and URL handling
  const processContent = (str: string) => {
    return str
      .replace(/^What to Watch Out For:?\s*/i, '') // Remove redundant title at start
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert encoded HTML tags
      .replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>') // Convert markdown bold to HTML
      .replace(/URL:\s*https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '') // Remove any remaining URLs
      .replace(/(\w)([.:])\s+/g, '$1$2 ') // Fix spacing after periods and colons
      .trim();
  };
  
  // More robust empty content check
  const isEmptyContent = (str: string) => {
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };

  // Extract application details into a structured format
  const extractDetails = (str: string) => {
    // Check if content contains details section
    if (str.includes('details:') || str.includes('Reference:')) {
      const detailsObj: Record<string, string> = {};
      
      // Try to extract common planning application fields
      const referenceMatch = str.match(/Reference:\s*([^,\n]+)/i);
      const typeMatch = str.match(/Type:\s*([^,\n]+)/i);
      const statusMatch = str.match(/Status:\s*([^,\n]+)/i);
      const descriptionMatch = str.match(/Description:\s*([^.]+)/i);
      
      if (referenceMatch) detailsObj.Reference = referenceMatch[1].trim();
      if (typeMatch) detailsObj.Type = typeMatch[1].trim();
      if (statusMatch) detailsObj.Status = statusMatch[1].trim();
      if (descriptionMatch) detailsObj.Description = descriptionMatch[1].trim();
      
      // If we found any details, format them nicely
      if (Object.keys(detailsObj).length > 0) {
        // Remove the details section from the original content
        let mainContent = str
          .replace(/details:.*$/is, '')
          .replace(/Reference:.*$/is, '')
          .trim();
        
        // Format details as a clean list
        const detailsHtml = Object.entries(detailsObj)
          .map(([key, value]) => `<div class="flex gap-2 items-start">
            <span class="font-semibold min-w-16">${key}:</span>
            <span class="flex-1">${value}</span>
          </div>`)
          .join('');
        
        return {
          mainContent,
          detailsHtml
        };
      }
    }
    
    // No structured details found, return original content
    return {
      mainContent: str,
      detailsHtml: ''
    };
  };
  
  // Format the content with proper paragraphs and bullet points if needed
  const formatHtmlContent = (inputContent: string | string[]) => {
    if (Array.isArray(inputContent)) {
      // Handle array content - create proper bullet points
      const validItems = inputContent.filter(item => item && !isEmptyContent(item));
      
      if (validItems.length === 0) return '';
      
      return `<ul class="list-disc pl-5 space-y-2 my-0">
        ${validItems.map(item => {
          const processed = processContent(item);
          const { mainContent, detailsHtml } = extractDetails(processed);
          
          return `<li class="pl-1 mb-2 text-left">
            ${mainContent}
            ${detailsHtml ? `<div class="mt-2 space-y-1 text-xs text-gray-700">${detailsHtml}</div>` : ''}
          </li>`;
        }).join('')}
      </ul>`;
    } else {
      // Handle string content
      let contentStr = processContent(inputContent);
      
      if (isEmptyContent(contentStr)) return '';
      
      // Extract and format details if present
      const { mainContent, detailsHtml } = extractDetails(contentStr);
      contentStr = mainContent;
      
      // Make headers bold
      contentStr = contentStr.replace(
        /(The Details:|Details:|Considerations:|Key Considerations:)/gi,
        '<strong class="font-bold text-gray-800">$1</strong>'
      );
      
      // Check if content has bullet points and format properly
      if (contentStr.includes('•') || contentStr.includes('*') || contentStr.includes('-')) {
        const parts = contentStr.split(/(?:•|\*|-)\s+/).filter(Boolean);
        if (parts.length > 1) {
          return `<div>
            <div class="text-left">${parts[0]}</div>
            <ul class="list-disc pl-5 space-y-2 my-2">
              ${parts.slice(1).map(part => `<li class="pl-1 mb-2 text-left">${part.trim()}</li>`).join('')}
            </ul>
            ${detailsHtml ? `<div class="mt-2 space-y-1 text-xs text-gray-700">${detailsHtml}</div>` : ''}
          </div>`;
        }
      }
      
      // Add paragraph tags if not already present
      if (!contentStr.includes('<p>')) {
        contentStr = `<p class="my-0 mt-2 text-left">${contentStr}</p>`;
      }
      
      // Append details if present
      if (detailsHtml) {
        contentStr += `<div class="mt-2 space-y-1 text-xs text-gray-700">${detailsHtml}</div>`;
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
