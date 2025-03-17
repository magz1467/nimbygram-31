
interface NimbySectionProps {
  content: string;
}

// Format bullet points from content string
const formatBulletPoints = (content: string) => {
  if (!content) return null;
  
  // Check if content contains bullet point markers
  if (content.includes('•') || content.includes('*') || content.includes('-')) {
    // Split by common bullet point markers, supporting emoji bullet points
    // Look for bullet points that might be followed by emoji characters
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
  
  // Fallback to regular paragraph if no bullet points detected
  return <p className="mt-2 text-left">{content}</p>;
};

export const NimbySection = ({ content }: NimbySectionProps) => {
  if (!content) return null;
  
  return (
    <div className="mt-3 p-3 bg-purple-50 rounded-md">
      <p className="font-medium text-purple-800 flex items-center gap-1">
        <span>🏘️</span> Nimbywatch
      </p>
      <div className="text-purple-700 mt-1">
        {formatBulletPoints(content)}
      </div>
    </div>
  );
};
