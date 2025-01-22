import { Application } from "@/types/planning";
import { EmailDialog } from "@/components/EmailDialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ApplicationListView } from "./sidebar/ApplicationListView";
import { ApplicationDetailView } from "./sidebar/ApplicationDetailView";

interface DesktopSidebarProps {
  applications: Application[];
  selectedApplication: number | null;
  postcode: string;
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: 'closingSoon' | 'newest' | null;
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: 'closingSoon' | 'newest' | null) => void;
  onSelectApplication: (id: number | null) => void;
  onDismiss: () => void;
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
}

export const DesktopSidebar = ({
  applications,
  selectedApplication,
  postcode,
  activeFilters,
  activeSort,
  onFilterChange,
  onSortChange,
  onSelectApplication,
  onDismiss,
  statusCounts
}: DesktopSidebarProps) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const { toast } = useToast();

  const selectedApplicationData = selectedApplication
    ? applications.find((app) => app.id === selectedApplication)
    : null;

  const handleEmailSubmit = (radius: string) => {
    const radiusText = radius === "1000" ? "1 kilometre" : `${radius} metres`;
    toast({
      title: "Subscription pending",
      description: `We've sent a confirmation email to your registered email. Please check your inbox and click the link to confirm your subscription for planning alerts within ${radiusText} of ${postcode}. The email might take a few minutes to arrive.`,
      duration: 5000,
    });
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {selectedApplication === null ? (
        <ApplicationListView
          applications={applications}
          selectedApplication={selectedApplication}
          postcode={postcode}
          onSelectApplication={onSelectApplication}
          onShowEmailDialog={() => setShowEmailDialog(true)}
          onFilterChange={onFilterChange}
          onSortChange={onSortChange}
          activeFilters={activeFilters}
          activeSort={activeSort}
          statusCounts={statusCounts}
        />
      ) : selectedApplicationData && (
        <ApplicationDetailView
          application={selectedApplicationData}
          onDismiss={onDismiss}
        />
      )}

      <EmailDialog 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSubmit={handleEmailSubmit}
        postcode={postcode}
      />
    </div>
  );
};