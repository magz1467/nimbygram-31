
interface NimbySectionProps {
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
