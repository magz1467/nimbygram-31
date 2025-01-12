import { Badge } from "@/components/ui/badge";

interface ClassificationBadgeProps {
  classification: string | { _type: string; value: string } | null;
  className?: string;
}

export const ClassificationBadge = ({ classification, className = "" }: ClassificationBadgeProps) => {
  if (!classification) return null;

  // Handle both string and object formats
  const classificationValue = typeof classification === 'string' ? 
    classification : 
    classification.value;

  // Add more detailed logging
  console.log('ClassificationBadge input:', { 
    classification,
    classificationValue,
    type: typeof classification,
    className 
  });

  // Only return null if the actual value is undefined or "undefined"
  if (!classificationValue || classificationValue === 'undefined') {
    console.log('ClassificationBadge: Skipping render due to undefined value');
    return null;
  }

  return (
    <span 
      className={`${className} inline-flex items-center text-xs font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded`}
    >
      {classificationValue}
    </span>
  );
};