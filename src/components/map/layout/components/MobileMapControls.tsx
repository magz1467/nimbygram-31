
import { useCallback } from 'react';
import { Application } from "@/types/planning";
import { MobileApplicationCards } from "../../mobile/MobileApplicationCards";

interface MobileMapControlsProps {
  applications: Application[];
  selectedId: number | null;
  onSelectApplication: (id: number | null) => void;
  postcode: string;
}

export const MobileMapControls = ({
  applications,
  selectedId,
  onSelectApplication,
  postcode,
}: MobileMapControlsProps) => {
  const handleSelectApplication = useCallback((id: number | null) => {
    console.log('MobileMapControls handleSelectApplication:', id);
    onSelectApplication(id);
  }, [onSelectApplication]);

  return (
    <MobileApplicationCards
      applications={applications}
      selectedId={selectedId}
      onSelectApplication={handleSelectApplication}
      postcode={postcode}
    />
  );
};
