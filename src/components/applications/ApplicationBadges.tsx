import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";
import { getStatusColor, getStatusText } from "@/utils/statusColors";
import { isWithinNextSevenDays } from "@/utils/dateUtils";

interface ApplicationBadgesProps {
  status: string;
  lastDateConsultationComments?: string | null;
  class3?: string | null;
}

export const ApplicationBadges = ({
  status,
  lastDateConsultationComments,
  class3
}: ApplicationBadgesProps) => {
  const badges = [];

  // Status badge
  badges.push(
    <span key="status" className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );

  // Closing soon badge
  if (lastDateConsultationComments && isWithinNextSevenDays(lastDateConsultationComments)) {
    badges.push(
      <span key="closing" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
        <Timer className="w-3 h-3" />
        Closing soon
      </span>
    );
  }

  // Classification badge - always show with default value
  const classificationText = class3 && typeof class3 === 'string' && class3.toLowerCase() !== 'undefined'
    ? class3
    : 'Miscellaneous';

  // Add emoji based on classification
  let emoji = '🔄 ';  // Default emoji for miscellaneous
  const lowerClass = classificationText.toLowerCase();
  if (lowerClass.includes('tree')) {
    emoji = '🌳 ';
  } else if (lowerClass.includes('home extension') || lowerClass.includes('extension')) {
    emoji = '🏠 ';
  } else if (lowerClass.includes('amendment')) {
    emoji = '📄 ';
  } else if (lowerClass.includes('certificate')) {
    emoji = '📜 ';
  } else if (lowerClass.includes('landscaping')) {
    emoji = '🌱 ';
  } else if (lowerClass.includes('redevelopment')) {
    emoji = '👷 ';
  }

  badges.push(
    <Badge key="classification" variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
      {emoji}{classificationText}
    </Badge>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges}
    </div>
  );
};