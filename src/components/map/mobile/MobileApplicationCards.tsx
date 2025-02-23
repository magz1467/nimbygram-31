
import { Application } from "@/types/planning";
import { ApplicationListView } from "../sidebar/ApplicationListView";

interface MobileApplicationCardsProps {
  applications: Application[];
  selectedId: number | null;
  onSelectApplication: (id: number) => void;
  postcode: string;
}

export const MobileApplicationCards = ({
  applications,
  selectedId,
  onSelectApplication,
  postcode,
}: MobileApplicationCardsProps) => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-white shadow-lg rounded-t-xl z-10 max-h-[40vh] overflow-hidden">
      <ApplicationListView
        applications={applications}
        selectedApplication={selectedId}
        onSelectApplication={onSelectApplication}
        onShowEmailDialog={() => {}}
        postcode={postcode}
        hideFilterBar={true}
      />
    </div>
  );
};
