
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
  coordinates?: [number, number] | null; // Added search coordinates prop
}

export const PlanningApplicationList = ({
  applications,
  postcode,
  onSelectApplication,
  activeSort,
  onFeedback,
  coordinates // Original search coordinates
}: PlanningApplicationListProps) => {
  const sortedApplications = useApplicationSorting({
    type: activeSort || null,
    applications
  });

  console.log('PlanningApplicationList - Rendering with applications:', applications?.length);
  
  // Log received date for debugging
  if (applications?.length > 0) {
    console.log('Sample received date:', applications[0].received || 
    applications[0].received_date || 'Not available');
  }

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
          allApplications={applications} // Pass all applications for map context
          searchCoordinates={coordinates || undefined} // Pass search coordinates
        />
      ))}
    </div>
  );
};
