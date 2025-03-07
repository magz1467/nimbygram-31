import { Application } from "@/types/planning";
import { ApplicationTimeline } from "./ApplicationTimeline";
import { CollapsibleApplicationDetails } from "./CollapsibleApplicationDetails";
import { ApplicationDescription } from "./ApplicationDescription";
import { ApplicationComments } from "./ApplicationComments";
import { ExpectedImpactAreas } from "./ExpectedImpactAreas";
import { ApplicationDocuments } from "./ApplicationDocuments";
import { CreatePetition } from "./CreatePetition";
import { ApplicationFeedback } from "./ApplicationFeedback";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApplicationImage } from "./ApplicationImage";

interface ApplicationContentProps {
  application: Application;
  feedback: 'yimby' | 'nimby' | null;
  feedbackStats: {
    yimbyCount: number;
    nimbyCount: number;
  };
  onFeedback: (type: 'yimby' | 'nimby') => void;
}

export const ApplicationContent = ({
  application,
  feedback,
  feedbackStats,
  onFeedback,
}: ApplicationContentProps) => {
  return (
    <>
      <Card className="overflow-hidden">
        <ApplicationImage application={application} />
        <ApplicationTimeline application={application} />
        <Separator className="my-4" />
        <CollapsibleApplicationDetails application={application} />
      </Card>

      {application.impact_score_details?.impacted_services && (
        <ExpectedImpactAreas 
          application={application}
          impactedServices={application.impact_score_details.impacted_services}
        />
      )}

      <ApplicationDescription application={application} />
      
      <ApplicationFeedback 
        feedback={feedback}
        onFeedback={onFeedback}
        feedbackStats={feedbackStats}
      />

      <ApplicationComments applicationId={application.id} />
      <CreatePetition applicationId={application.id} />
      <ApplicationDocuments />
    </>
  );
};