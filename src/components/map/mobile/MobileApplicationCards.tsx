
import { Application } from "@/types/planning";
import { useRef, useEffect, useState } from "react";
import { MiniCard } from "./MiniCard";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
  postcode,
}: MobileApplicationCardsProps) => {
  const selectedApplication = applications.find(app => app.id === selectedId);

  if (!selectedApplication) return null;

  return (
    <MiniCard 
      application={selectedApplication}
      onClick={() => onSelectApplication(selectedApplication.id)}
    />
  );
};
