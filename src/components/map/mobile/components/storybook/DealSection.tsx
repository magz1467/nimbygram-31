
interface DealSectionProps {
  content: string;
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

export const DealSection = ({ content }: DealSectionProps) => {
  if (!content) return null;
  
  return (
    <div className="mb-4 bg-primary/5 rounded-lg p-3">
      <p className="font-medium text-primary text-left">What's the Deal</p>
      <div className="mt-1">
        {formatBulletPoints(content)}
      </div>
    </div>
  );
};
