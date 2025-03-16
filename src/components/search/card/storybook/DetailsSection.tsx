
import { FC } from "react";

interface DetailsSectionProps {
  content: string[] | string;
}

export const DetailsSection: FC<DetailsSectionProps> = ({ content }) => {
  if (!content) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Key Details</h3>
      <div className="grid gap-3">
        {Array.isArray(content) ? (
          content
            .filter((detail) => detail && detail.trim().length > 0)
            .map((detail, index) => (
              <div key={index} className="flex gap-2.5 items-start">
                <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div 
                  className="text-gray-700 flex-1"
                  dangerouslySetInnerHTML={{ 
                    __html: detail.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>') 
                  }}
                />
              </div>
            ))
        ) : (
          <div 
            className="text-gray-700"
            dangerouslySetInnerHTML={{ 
              __html: typeof content === 'string' 
                ? content.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                : content || ''
            }}
          />
        )}
      </div>
    </div>
  );
};
