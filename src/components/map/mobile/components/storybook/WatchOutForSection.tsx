
import React, { FC } from "react";

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
          .map(([key, value]) => `<div class="flex gap-2 text-xs">
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

  const formatContent = (inputContent: string | string[]) => {
    if (Array.isArray(inputContent)) {
      const processedItems = inputContent
        .filter(item => item && item.trim().length > 0)
        .map(item => {
          const processed = processContent(item);
          const { mainContent, detailsHtml } = extractDetails(processed);
          
          return `<div class="mb-2">
            <div>${mainContent}</div>
            ${detailsHtml ? `<div class="mt-1 space-y-1">${detailsHtml}</div>` : ''}
          </div>`;
        });
      
      return processedItems.join('');
    } else {
      const processed = processContent(inputContent);
      const { mainContent, detailsHtml } = extractDetails(processed);
      
      return `<div>
        <div>${mainContent}</div>
        ${detailsHtml ? `<div class="mt-2 space-y-1">${detailsHtml}</div>` : ''}
      </div>`;
    }
  };

  const htmlContent = content ? formatContent(content) : '';
  if (!htmlContent) return null;

  return (
    <div className="bg-[#FFDEE2] text-gray-700 rounded-md p-3 mt-3">
      <h4 className="font-semibold mb-1 text-xs flex items-center gap-1">
        <span>👀</span> What to Watch Out For
      </h4>
      <div
        className="text-xs space-y-1"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
