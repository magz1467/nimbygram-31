
import { Application } from "@/types/planning";
import { useRef, useEffect, useState } from "react";
import { MiniCard } from "./MiniCard";

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
  console.log('🔄 MobileApplicationCards rendering with:', {
    applicationsCount: applications.length,
    selectedId,
    postcode
  });

  const selectedApplication = applications.find(app => app.id === selectedId);
  
  console.log('📱 Selected application:', selectedApplication);

  useEffect(() => {
    console.log('💫 MobileApplicationCards mounted/updated');
    
    // Prevent body scrolling when minicard is visible
    if (selectedApplication) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      console.log('👋 MobileApplicationCards unmounting');
      document.body.style.overflow = '';
    };
  }, [selectedId, selectedApplication]);

  if (!selectedApplication) {
    console.log('⚠️ No selected application found');
    return null;
  }

  return (
    <MiniCard 
      application={selectedApplication}
      onClick={() => {
        console.log('🖱️ MiniCard clicked, calling onSelectApplication with:', selectedApplication.id);
        onSelectApplication(selectedApplication.id);
      }}
    />
  );
};
