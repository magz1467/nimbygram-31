
import { FormattedStorybook } from "@/utils/storybook/types";

interface StorybookContentProps {
  formattedStorybook: FormattedStorybook | null;
  storybook: string | null | undefined;
  description: string | undefined;
}

// Format bullet points from content string
const formatBulletPoints = (content: string) => {
  if (!content) return null;
  
  if (content.includes('•') || content.includes('*') || content.includes('-')) {
    const parts = content.split(/(?:•|\*|-)\s+/).filter(Boolean);
    if (parts.length > 1) {
      return (
        <ul className="list-disc pl-5 space-y-1 mt-2 text-left">
          {parts.map((part, idx) => (
            <li key={idx} className="pl-1 mb-1.5">{part.trim()}</li>
          ))}
        </ul>
      );
    }
  }
  return <p className="mt-2 text-left">{content}</p>;
};

// Extract emoji from beginning of text
const extractEmoji = (text: string) => {
  const emojiMatch = text.match(/^([\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/u);
  return {
    emoji: emojiMatch ? emojiMatch[1] : null,
    text: emojiMatch ? text.substring(emojiMatch[0].length).trim() : text
  };
};

export const StorybookContent = ({ formattedStorybook, storybook, description }: StorybookContentProps) => {
  if (formattedStorybook?.sections) {
    return (
      <div className="text-sm text-gray-600 mb-3">
        {formattedStorybook.sections.find(s => s.type === 'deal') && (
          <div className="mb-4 bg-primary/5 rounded-lg p-3">
            <p className="font-medium text-primary text-left">What's the Deal</p>
            <div className="mt-1">
              {typeof formattedStorybook.sections.find(s => s.type === 'deal')?.content === 'string' && 
                formatBulletPoints(formattedStorybook.sections.find(s => s.type === 'deal')?.content as string)}
            </div>
          </div>
        )}
        
        {formattedStorybook.sections.find(s => s.type === 'details') && (
          <div className="mb-4">
            <p className="font-medium text-gray-800 text-left">Key Details</p>
            {Array.isArray(formattedStorybook.sections.find(s => s.type === 'details')?.content) ? (
              <ul className="space-y-2 mt-2">
                {(formattedStorybook.sections
                  .find(s => s.type === 'details')
                  ?.content as string[])
                  .filter((detail: string) => detail && detail.trim().length > 0) // Filter out empty bullet points
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
            ) : (
              formatBulletPoints(formattedStorybook.sections.find(s => s.type === 'details')?.content as string)
            )}
          </div>
        )}
        
        {formattedStorybook.sections.find(s => s.type === 'watchOutFor') && (
          <div className="mt-3 p-3 bg-pink-50 rounded-md">
            <p className="font-medium text-pink-800 flex items-center gap-1">
              <span>👀</span> What to Watch Out For
            </p>
            <div className="text-pink-700 mt-1">
              {typeof formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content === 'string' ? (
                formatBulletPoints(formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content as string)
              ) : (
                <div 
                  className="prose prose-sm max-w-none mt-2"
                  dangerouslySetInnerHTML={{ 
                    __html: formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content as string 
                  }}
                />
              )}
            </div>
          </div>
        )}
        
        {formattedStorybook.sections.find(s => s.type === 'keyRegulations') && (
          <div className="mt-3 p-3 bg-green-50 rounded-md">
            <p className="font-medium text-green-800 flex items-center gap-1">
              <span>📃</span> Key Regulations
            </p>
            <div className="text-green-700 mt-1">
              {typeof formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content === 'string' ? (
                formatBulletPoints(formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content as string)
              ) : (
                <div 
                  className="prose prose-sm max-w-none mt-2"
                  dangerouslySetInnerHTML={{ 
                    __html: formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content as string 
                  }}
                />
              )}
            </div>
          </div>
        )}
        
        {formattedStorybook.sections.find(s => s.type === 'nimby') && (
          <div className="mt-3 p-3 bg-purple-50 rounded-md">
            <p className="font-medium text-purple-800 flex items-center gap-1">
              <span>🏘️</span> Nimbywatch
            </p>
            <div className="text-purple-700 mt-1">
              {typeof formattedStorybook.sections.find(s => s.type === 'nimby')?.content === 'string' ? (
                formatBulletPoints(formattedStorybook.sections.find(s => s.type === 'nimby')?.content as string)
              ) : (
                <div 
                  className="prose prose-sm max-w-none mt-2"
                  dangerouslySetInnerHTML={{ 
                    __html: formattedStorybook.sections.find(s => s.type === 'nimby')?.content as string 
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  } else if (formattedStorybook?.content) {
    return (
      <div 
        className="text-sm text-gray-600 mb-3 prose prose-sm max-w-none text-left"
        dangerouslySetInnerHTML={{ 
          __html: formattedStorybook.content
        }}
      />
    );
  } else if (storybook) {
    return (
      <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap line-clamp-4 text-left">
        {storybook}
      </p>
    );
  } else {
    return (
      <p className="text-sm text-gray-600 mb-3 line-clamp-3 text-left">
        {description || "No description available"}
      </p>
    );
  }
};
