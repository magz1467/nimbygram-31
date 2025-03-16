
import { FC } from "react";

interface NimbySectionProps {
  content: string | string[];
}

export const NimbySection: FC<NimbySectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process HTML content
  const processContent = (str: string) => {
    return str
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>'); // Convert encoded HTML tags
  };
  
  // More robust empty content check
  const isEmptyContent = (str: string) => {
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };
  
  // If array, filter out empty items and join
  const htmlContent = typeof content === 'string'
    ? processContent(content)
    : content.filter(item => item && !isEmptyContent(item))
            .map(processContent)
            .join('<br/>');
  
  // If after processing we have no content, return null
  if (isEmptyContent(htmlContent)) return null;
  
  return (
    <div className="bg-[#8B5CF6] text-white rounded-lg p-4">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        🏘️ Nimbywatch
      </h3>
      <div 
        className="space-y-2 text-white/90"
        dangerouslySetInnerHTML={{ 
          __html: htmlContent.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
        }}
      />
    </div>
  );
};
