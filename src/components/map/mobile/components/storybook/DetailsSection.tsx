
import { ReactNode } from "react";

interface DetailsSectionProps {
  content: string | string[] | undefined;
}

// Extract emoji from beginning of text
const extractEmoji = (text: string) => {
  const emojiMatch = text.match(/^([\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/u);
  return {
    emoji: emojiMatch ? emojiMatch[1] : null,
    text: emojiMatch ? text.substring(emojiMatch[0].length).trim() : text
  };
};

export const DetailsSection = ({ content }: DetailsSectionProps) => {
  if (!content) return null;
  
  let detailContent: ReactNode;
  
  if (Array.isArray(content)) {
    detailContent = (
      <ul className="space-y-2 mt-2">
        {content
          .filter((detail: string) => detail && detail.trim().length > 0)
          .map((detail: string, index: number) => {
            const { emoji, text } = extractEmoji(detail);
            return (
              <li key={index} className="flex items-start gap-2 mb-2 text-left">
                <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 break-words">
                  {emoji && <span className="mr-1 inline-block align-middle">{emoji}</span>}
                  <span>{text}</span>
                </div>
              </li>
            );
          })}
      </ul>
    );
  } else {
    detailContent = (
      <div className="mt-2 text-left">
        {typeof content === 'string' && content.includes('•') ? (
          <ul className="list-disc pl-5 space-y-1">
            {content.split('•').filter(Boolean).map((item, idx) => (
              <li key={idx} className="pl-1 mb-1.5">{item.trim()}</li>
            ))}
          </ul>
        ) : (
          <p>{content}</p>
        )}
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <p className="font-medium text-gray-800 text-left">Key Details</p>
      {detailContent}
    </div>
  );
};
