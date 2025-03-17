
interface FallbackContentProps {
  storybook: string | null | undefined;
  description: string | undefined;
}

// Format bullet points from content string
const formatBulletPoints = (content: string) => {
  if (!content) return null;
  
  // Check if content contains bullet point markers
  if (content.includes('•') || content.includes('*') || content.includes('-')) {
    // Split by common bullet point markers, supporting emoji bullet points
    const bulletPointRegex = /(?:^|\n)\s*(?:[•\*\-]|\p{Emoji_Presentation})\s*/gu;
    const parts = content.split(bulletPointRegex).filter(Boolean);
    
    // Check if we have valid parts after splitting
    if (parts.length > 1 || bulletPointRegex.test(content)) {
      // Extract bullet points with their markers using regex
      const matches = [...content.matchAll(/(?:^|\n)\s*((?:[•\*\-]|\p{Emoji_Presentation})\s*)(.*?)(?=(?:\n\s*(?:[•\*\-]|\p{Emoji_Presentation})\s*|$))/gsu)];
      
      if (matches.length > 0) {
        return (
          <ul className="list-none pl-0 space-y-2 mt-2 text-left">
            {matches.map((match, idx) => {
              const marker = match[1]?.trim() || '•';
              const text = match[2]?.trim();
              
              // Skip empty bullet points
              if (!text) return null;
              
              return (
                <li key={idx} className="flex items-start gap-2 mb-2">
                  <span className="flex-shrink-0">{marker}</span>
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
        );
      }
    }
  }
  
  // Fallback to regular paragraph
  return <p className="whitespace-pre-wrap">{content}</p>;
};

export const FallbackContent = ({ storybook, description }: FallbackContentProps) => {
  if (storybook) {
    return (
      <div className="text-sm text-gray-600 mb-3">
        {formatBulletPoints(storybook)}
      </div>
    );
  } else {
    return (
      <p className="text-sm text-gray-600 mb-3 line-clamp-3 text-left">
        {description || "No description available"}
      </p>
    );
  }
};
