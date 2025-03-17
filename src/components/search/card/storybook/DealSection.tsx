
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
  
  // Clean up the content - handle potential duplicated "What's the Deal:" prefixes
  let processedContent = content
    .replace(/^What['']s the Deal:?\s*/i, '') // Remove redundant title at start
    .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>'); // Convert encoded HTML tags
  
  // Check for bullet points in the deal section and format properly
  if (processedContent.includes('•') || processedContent.includes('*') || processedContent.includes('-')) {
    const parts = processedContent.split(/(?:•|\*|-)\s+/).filter(Boolean);
    if (parts.length > 1) {
      // This actually has bullet points
      processedContent = parts.map(part => `<p>${part.trim()}</p>`).join('');
    }
  }
  
  return (
    <div className="prose prose-sm max-w-none">
      <div className="bg-primary/5 rounded-lg p-4">
        <h3 className="text-primary font-semibold mb-2">What's the Deal</h3>
        <div 
          className="text-gray-700"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>
    </div>
  );
};
