
interface DealSectionProps {
  content: string;
}

// Format bullet points from content string with improved extraction
const formatBulletPoints = (content: string) => {
  if (!content) return null;
  
  // Check if content contains bullet point markers
  if (content.includes('•') || content.includes('*') || content.includes('-')) {
    // Extract bullet points with their markers using regex - more reliable approach
    const matches = [...content.matchAll(/(?:^|\n)\s*([•\*\-])\s*(.*?)(?=(?:\n\s*[•\*\-]|$))/gs)];
    
    if (matches.length > 0) {
      return (
        <ul className="list-none pl-0 space-y-2 mt-2 text-left">
          {matches.map((match, idx) => {
            const bulletText = match[2]?.trim();
            
            // Skip empty bullet points
            if (!bulletText) return null;
            
            // Look for emoji at start of bullet text
            const emojiMatch = bulletText.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}✓])/u);
            const emoji = emojiMatch ? emojiMatch[1] : null;
            const text = emoji ? bulletText.substring(emoji.length).trim() : bulletText;
            
            return (
              <li key={idx} className="flex items-start gap-2 mb-2">
                <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1">
                  {emoji && <span className="mr-1.5 inline-block">{emoji}</span>}
                  <span>{text}</span>
                </div>
              </li>
            );
          })}
        </ul>
      );
    }
  }
  
  // If no bullet points found or couldn't parse them properly, 
  // return as a regular paragraph
  return <p className="mt-2 text-left">{content}</p>;
};

export const DealSection = ({ content }: DealSectionProps) => {
  if (!content) return null;
  
  // Clean up the content - remove redundant titles
  const cleanedContent = content
    .replace(/^What['']s the Deal:?\s*/i, '')
    .replace(/\*\*/g, ''); // Remove ** markers
  
  return (
    <div className="mb-4 bg-primary/5 rounded-lg p-3">
      <p className="font-medium text-primary text-left">What's the Deal</p>
      <div className="mt-1">
        {formatBulletPoints(cleanedContent)}
      </div>
    </div>
  );
};
