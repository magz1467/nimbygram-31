
import { Application } from "@/types/planning";
import { useApplicationSorting } from "@/hooks/use-sort-applications";
import { ApplicationListItem } from "./applications/list/ApplicationListItem";
import { EmptyState } from "./applications/list/EmptyState";
import { SortType } from "@/types/application-types";

interface PlanningApplicationListProps {
  applications: Application[];
  postcode: string;
  onSelectApplication: (id: number | null) => void;
  activeSort?: SortType;
  onFeedback?: (applicationId: number, type: 'yimby' | 'nimby') => void;
}

export const PlanningApplicationList = ({
  applications,
  onSelectApplication,
  activeSort,
  onFeedback
}: PlanningApplicationListProps) => {
  const sortedApplications = useApplicationSorting({
    type: activeSort || null,
    applications
  });

  console.log('PlanningApplicationList - Rendering with applications:', applications?.length);

  if (!applications?.length) {
    return <EmptyState />;
  }

  return (
    <div className="divide-y">
      {sortedApplications.map((application) => (
        <ApplicationListItem
          key={application.id}
          application={application}
          onSelect={onSelectApplication}
          onFeedback={onFeedback}
        />
      ))}
    </div>
  );
};
