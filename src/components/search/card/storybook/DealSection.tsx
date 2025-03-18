
import { FC, useEffect } from "react";
import { logStorybook } from "@/utils/storybook/logger";

interface DealSectionProps {
  content: string;
  applicationId?: number;
}

export const DealSection: FC<DealSectionProps> = ({ content, applicationId }) => {
  if (!content) return null;
  
  // Debug logging
  useEffect(() => {
    logStorybook.section('deal', content, applicationId);
  }, [content, applicationId]);
  
  // Process content to clean up common issues
  const processedContent = content
    .replace(/^What's the Deal:?\s*/i, '') // Remove redundant title at start
    .replace(/^The Deal:?\s*/i, '') // Remove alternate title format
    .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert encoded HTML tags
    .trim();
  
  // Check if content is effectively empty
  if (!processedContent || processedContent.replace(/[\s•\-*]/g, '').length === 0) {
    return null;
  }
    
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2 text-base md:text-lg text-left">What's the Deal?</h3>
      <p className="text-gray-700 whitespace-pre-line text-left">
        {processedContent}
      </p>
    </div>
  );
};
