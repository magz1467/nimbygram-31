
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
  
  // Check for bullet points in the content
  const hasBulletPoints = processedContent.includes('•') || 
                          processedContent.includes('*') || 
                          processedContent.includes('-') || 
                          processedContent.includes('🏠') ||
                          processedContent.includes('🔍');
  
  // Format the content based on whether it contains bullet points
  let formattedContent;
  
  if (hasBulletPoints) {
    // Split by common bullet markers and emoji
    const bulletPattern = /(?:•|\*|-|🏠|🔍|🏢|📝|🔑|📃)/;
    const parts = processedContent.split(bulletPattern).filter(Boolean);
    
    if (parts.length > 1) {
      // Create a proper HTML list for bullet points
      formattedContent = `<ul class="list-disc pl-5 space-y-2 mt-2">
        ${parts.map(part => `<li class="pl-1 mb-2 text-left">${part.trim()}</li>`).join('')}
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
        <h3 className="text-primary font-semibold mb-3 text-base md:text-lg text-left">What's the Deal</h3>
        <div 
          className="text-gray-700"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>
    </div>
  );
};
