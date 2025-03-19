
import { Card } from "@/components/ui/card";
import { Application } from "@/types/planning";
import { isWithinNextSevenDays } from "@/utils/dateUtils";

interface ApplicationDetailsProps {
  application?: Application;
}

export const ApplicationDetails = ({ application }: ApplicationDetailsProps) => {
  if (!application) return null;

  // Using nullish coalescing to handle undefined properties
  const submissionDate = application.submittedDate || application.received_date || application.received || '';
  const isConsultationEndingSoon = isWithinNextSevenDays(application.consultationEnd);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-600">Reference:</dt>
          <dd>{application.reference}</dd>
          
          <dt className="text-gray-600">Type:</dt>
          <dd>{application.type}</dd>
          
          <dt className="text-gray-600">Applicant:</dt>
          <dd>{application.applicant}</dd>
          
          <dt className="text-gray-600">Submission Date:</dt>
          <dd>{submissionDate}</dd>
          
          <dt className="text-gray-600">Ward:</dt>
          <dd>{application.ward}</dd>
          
          <dt className="text-gray-600">Case Officer:</dt>
          <dd>{application.officer}</dd>
        </dl>
      </div>
    </Card>
  );
};
