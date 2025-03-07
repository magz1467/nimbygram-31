
import { Application } from "@/types/planning";
import { ApplicationFeedback } from "./ApplicationFeedback";
import { ApplicationDescription } from "./ApplicationDescription";
import { ApplicationImage } from "./ApplicationImage";
import { ApplicationTimeline } from "./ApplicationTimeline";
import { ApplicationComments } from "./ApplicationComments";
import { ApplicationDetails } from "./ApplicationDetails";
import ImpactScoreDetails from "./impact-score/ImpactScoreDetails";

interface ApplicationContentProps {
  application: Application;
  feedback: 'yimby' | 'nimby' | null;
  feedbackStats: {
    yimbyCount: number;
    nimbyCount: number;
  };
  onFeedback: (type: 'yimby' | 'nimby') => void;
  userId?: string;
}

export const ApplicationContent = ({ 
  application, 
  feedback, 
  feedbackStats, 
  onFeedback,
  userId
}: ApplicationContentProps) => {
  const showImpactScore = application.final_impact_score !== null;

  return (
    <div className="space-y-6">
      <ApplicationImage application={application} />
      
      <ApplicationFeedback 
        feedback={feedback} 
        onFeedback={onFeedback} 
        feedbackStats={feedbackStats}
        applicationId={application.id}
        userId={userId}
      />
      
      <ApplicationDescription application={application} />
      
      <ApplicationDetails application={application} />
      
      {showImpactScore && (
        <ImpactScoreDetails 
          application={application}
        />
      )}
      
      <ApplicationTimeline application={application} />
      
      <ApplicationComments applicationId={application.id} />
    </div>
  );
}
