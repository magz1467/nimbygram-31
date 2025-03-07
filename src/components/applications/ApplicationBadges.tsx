
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";
import { getStatusColor, getStatusText } from "@/utils/statusColors";
import { isWithinNextSevenDays } from "@/utils/dateUtils";

interface ApplicationBadgesProps {
  status: string;
  lastDateConsultationComments?: string | null;
  impactScore?: number | null;
  validDate?: string | null;
}

export const ApplicationBadges = ({
  status,
  lastDateConsultationComments,
  validDate
}: ApplicationBadgesProps) => {
  const badges = [];

  // Status badge
  badges.push(
    <span key="status" className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );

  // New application badge
  if (validDate) {
    const submissionDate = new Date(validDate);
    const novemberCutoff = new Date('2024-11-01');
    if (submissionDate > novemberCutoff) {
      badges.push(
        <span key="new" className="text-xs px-2 py-1 rounded bg-[#f6c8cc] text-[#47463f]">
          New
        </span>
      );
    }
  }

  // Closing soon badge
  if (lastDateConsultationComments && isWithinNextSevenDays(lastDateConsultationComments)) {
    badges.push(
      <span key="closing" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
        <Timer className="w-3 h-3" />
        Closing soon
      </span>
    );
  }

  // Impact score badge has been removed

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges}
    </div>
  );
};
