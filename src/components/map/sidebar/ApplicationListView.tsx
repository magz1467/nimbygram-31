import { Application } from "@/types/planning";
import { PlanningApplicationList } from "@/components/PlanningApplicationList";
import { AlertSection } from "./AlertSection";

interface ApplicationListViewProps {
  applications: Application[];
  postcode: string;
  onSelectApplication: (id: number | null) => void;
  onShowEmailDialog: () => void;
}

export const ApplicationListView = ({
  applications,
  postcode,
  onSelectApplication,
  onShowEmailDialog,
}: ApplicationListViewProps) => {
  return (
    <div className="flex flex-col h-[calc(100%-56px)] overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <AlertSection 
          postcode={postcode}
          onShowEmailDialog={onShowEmailDialog}
        />
        <PlanningApplicationList
          applications={applications}
          postcode={postcode}
          onSelectApplication={onSelectApplication}
        />
      </div>
    </div>
  );
};