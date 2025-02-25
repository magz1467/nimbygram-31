
import { Application } from "@/types/planning";
import { useMemo } from "react";
import { MiniCard } from "./MiniCard";
import { formatStorybook } from "@/utils/storybook-formatter";

interface MobileApplicationCardsProps {
  applications: Application[];
  selectedId: number | null;
  onSelectApplication: (id: number | null) => void;
  postcode: string;
}

export const MobileApplicationCards = ({
  applications,
  selectedId,
  onSelectApplication,
  postcode
}: MobileApplicationCardsProps) => {
  const selectedApplication = useMemo(() => {
    return applications.find(app => app.id === selectedId);
  }, [applications, selectedId]);

  if (!selectedApplication) return null;

  return (
    <MiniCard
      application={selectedApplication}
      onClick={() => onSelectApplication(selectedApplication.id)}
    />
  );
};
