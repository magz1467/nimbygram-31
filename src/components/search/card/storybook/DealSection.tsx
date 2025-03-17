
import { FC } from "react";

interface DealSectionProps {
  content: string;
}

export const DealSection: FC<DealSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // More robust empty content check
  const isEmptyContent = (str: string) => {
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };
  
  // Return null if content is effectively empty
  if (isEmptyContent(content)) return null;
  
  // Clean up the content - remove redundant titles and properly format
  let processedContent = content
    .replace(/^What['']s the Deal:?\s*/i, '') // Remove redundant title at start
    .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>'); // Convert encoded HTML tags
  
  // Check for bullet points in the deal section and format properly
  let formattedContent;
  if (processedContent.includes('•') || processedContent.includes('*') || processedContent.includes('-')) {
    const parts = processedContent.split(/(?:•|\*|-)\s+/).filter(Boolean);
    if (parts.length > 1) {
      // This actually has bullet points - create proper HTML list
      formattedContent = `<ul class="list-disc pl-5 space-y-1 mt-2">
        ${parts.map(part => `<li class="pl-1 mb-1 text-left">${part.trim()}</li>`).join('')}
      </ul>`;
    } else {
      formattedContent = `<p class="mt-2 text-left">${processedContent}</p>`;
    }
  } else {
    formattedContent = `<p class="mt-2 text-left">${processedContent}</p>`;
  }
  
  return (
    <div className="prose prose-sm max-w-none">
      <div className="bg-primary/5 rounded-lg p-4">
        <h3 className="text-primary font-semibold mb-2 text-base md:text-lg text-left">What's the Deal</h3>
        <div 
          className="text-gray-700"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>
    </div>
  );
};
