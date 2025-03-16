
import { FC } from "react";

interface FallbackContentProps {
  content?: string | null;
  storybook?: string | null;
}

export const FallbackContent: FC<FallbackContentProps> = ({ content, storybook }) => {
  // First try to use formatted content if available
  if (content) {
    return (
      <div className="prose prose-sm max-w-none" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }
  
  // Raw fallback if nothing was processed correctly
  if (storybook) {
    return (
      <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
        <h3 className="text-gray-900 font-medium mb-2">Application Details</h3>
        <div 
          className="whitespace-pre-wrap text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: storybook.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>').replace(/\n\*\s/g, '<br/>• ')
          }}
        />
      </div>
    );
  }
  
  return null;
};
