
import { FC } from "react";

interface DetailsSectionProps {
  content: string[] | string;
}

export const DetailsSection: FC<DetailsSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // Process HTML tags in content if it's a string
  const processString = (str: string) => {
    return str
      .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>'); // Convert encoded HTML tags
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Key Details</h3>
      <div className="grid gap-3">
        {Array.isArray(content) ? (
          content
            .filter((detail) => detail && detail.trim().length > 0) // Filter empty entries
            .map((detail, index) => (
              <div key={index} className="flex gap-2.5 items-start">
                <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div 
                  className="text-gray-700 flex-1"
                  dangerouslySetInnerHTML={{ 
                    __html: processString(detail)
                  }}
                />
              </div>
            ))
        ) : (
          <div 
            className="text-gray-700"
            dangerouslySetInnerHTML={{ 
              __html: processString(typeof content === 'string' ? content : String(content))
            }}
          />
        )}
      </div>
    </div>
  );
};
