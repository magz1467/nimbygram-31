
import { Application } from "@/types/planning";
import { PlanningApplicationDetails } from "@/components/PlanningApplicationDetails";
import { SortType } from "@/types/application-types";

interface MobileListDetailsViewProps {
  applications: Application[];
  selectedId: number | null;
  postcode: string;
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: SortType;
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: SortType) => void;
  onSelectApplication: (id: number | null) => void;
  onClose: () => void;
}

export const MobileListDetailsView = ({
  applications,
  selectedId,
  postcode,
  activeFilters,
  activeSort,
  onFilterChange,
  onSortChange,
  onSelectApplication,
  onClose,
}: MobileListDetailsViewProps) => {
  const selectedApplication = applications.find(app => app.id === selectedId);

  if (!selectedApplication) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <p className="text-gray-500">No application selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="sticky top-0 z-50 border-b py-2 px-4 bg-white flex justify-between items-center shadow-sm">
        <h2 className="font-semibold">Planning Application Details</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <PlanningApplicationDetails
          application={selectedApplication}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
