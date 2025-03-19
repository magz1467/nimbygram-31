
import { useState, useEffect } from "react";
import { Application } from "@/types/planning";
import { ApplicationTitle } from "@/components/applications/ApplicationTitle";

interface ApplicationMetadataProps {
  application: Application;
  onShowEmailDialog: () => void;
}

export const ApplicationMetadata = ({ 
  application,
  onShowEmailDialog,
}: ApplicationMetadataProps) => {
  useEffect(() => {
    console.log('ApplicationMetadata - Application Data:', {
      id: application?.id,
      final_impact_score: application?.final_impact_score,
      title: application?.title
    });
  }, [application]);

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-100';
    if (score >= 70) return 'bg-red-50 text-red-600';
    if (score >= 50) return 'bg-orange-50 text-orange-600';
    if (score >= 30) return 'bg-yellow-50 text-yellow-600';
    return 'bg-green-50 text-green-600';
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-semibold">
          <ApplicationTitle 
            title={application.title || application.reference} 
            className="!text-2xl"
          />
        </h2>
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full ${getScoreColor(application.final_impact_score)}`}>
          <span className="text-sm font-medium">Impact Score:</span>
          <span className="text-sm font-semibold">
            {application.final_impact_score ?? 'Not available'}
          </span>
        </div>
      </div>
    </div>
  );
};
