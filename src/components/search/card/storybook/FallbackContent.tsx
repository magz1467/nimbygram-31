
import { FC } from "react";

interface FallbackContentProps {
  content?: string | null;
  storybook?: string | null;
}

export const FallbackContent: FC<FallbackContentProps> = ({ content, storybook }) => {
  // Process HTML tags in content
  const processHtml = (str: string) => {
    return str
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert encoded HTML tags
      .replace(/\n\*\s*$/gm, '') // Remove empty bullet points
      .replace(/\n\*\s*\n/g, '\n'); // Remove empty bullet points with newlines
  };

  // First try to use formatted content if available
  if (content) {
    return (
      <div className="prose prose-sm max-w-none" 
        dangerouslySetInnerHTML={{ __html: processHtml(content) }} 
      />
    );
  }
  
  // Raw fallback if nothing was processed correctly
  if (storybook) {
    const processedStorybook = processHtml(storybook);
    return (
      <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
        <h3 className="text-gray-900 font-medium mb-2">Application Details</h3>
        <div 
          className="whitespace-pre-wrap text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: processedStorybook
              .replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
              .replace(/\n\*\s/g, '<br/>• ')
          }}
        />
      </div>
    );
  }
  
  return null;
};
