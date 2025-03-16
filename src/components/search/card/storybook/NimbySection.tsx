
import { FC } from "react";

interface NimbySectionProps {
  content: string | string[];
}

export const NimbySection: FC<NimbySectionProps> = ({ content }) => {
  if (!content) return null;
  
  return (
    <div className="bg-[#8B5CF6] text-white rounded-lg p-4">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        🏘️ Nimbywatch
      </h3>
      <div 
        className="space-y-2 text-white/90"
        dangerouslySetInnerHTML={{ 
          __html: typeof content === 'string'
            ? content.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
            : String(content) || ''
        }}
      />
    </div>
  );
};
