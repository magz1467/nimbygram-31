
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
  
  const htmlContent = typeof content === 'string'
    ? processContent(content)
    : content.filter(item => item && item.trim().length > 0)
            .map(processContent)
            .join('<br/>');
  
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
