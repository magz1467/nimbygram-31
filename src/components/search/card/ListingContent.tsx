
import React from 'react';
import { formatStorybook } from "@/utils/storybook-formatter";

interface ListingContentProps {
  storybook: string | null;
}

export const ListingContent = ({ storybook }: ListingContentProps) => {
  const formattedStorybook = formatStorybook(storybook);
  
  const parseHtmlContent = (content: string) => {
    return content
      .replace(/<\/?strong>/g, '')
      .replace(/<\/?p>/g, '')
      .replace(/<br\/?>/g, '\n')
      .trim();
  };

  const getKeyDetails = (content: string) => {
    const detailsSection = content.split('The Details:')[1]?.split('Considerations:')[0];
    if (!detailsSection) return [];
    
    return detailsSection
      .split('•')
      .slice(1)
      .map(detail => detail.trim())
      .filter(detail => detail.length > 0);
  };
  
  if (!formattedStorybook?.content) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {/* Display NimbyWatch box if present */}
      {formattedStorybook.content.includes('NimbyWatch') && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
          <p className="font-semibold text-amber-800 mb-1">⚠️ NimbyWatch</p>
          <div 
            className="text-amber-700"
            dangerouslySetInnerHTML={{ 
              __html: formattedStorybook.content
                .split('NimbyWatch:')[1]
                ?.split('<p>')[0] || ''
            }}
          />
        </div>
      )}

      {/* Key Points */}
      {formattedStorybook.content.includes('The Details:') && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Key Points:</h3>
          <ul className="space-y-1 pl-5 list-disc text-sm text-gray-700">
            {getKeyDetails(parseHtmlContent(formattedStorybook.content)).map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Display main content */}
      <div 
        className="text-sm text-gray-700 prose-sm"
        dangerouslySetInnerHTML={{ 
          __html: formattedStorybook.content 
        }}
      />
    </div>
  );
};
