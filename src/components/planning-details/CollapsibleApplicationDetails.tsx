
import { Application } from "@/types/planning";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CollapsibleApplicationDetailsProps {
  application: Application;
}

export const CollapsibleApplicationDetails = ({
  application,
}: CollapsibleApplicationDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="px-8 py-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between mb-2">
        <span className="text-sm font-medium">Application Details</span>
        <ChevronDown
          className={`h-4 w-4 transform transition-all duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-gray-500">Reference</div>
          <div>{application.reference || application.id?.toString() || 'Not available'}</div>

          <div className="text-gray-500">Status</div>
          <div>{application.status}</div>

          <div className="text-gray-500">Type</div>
          <div>{application.type}</div>

          <div className="text-gray-500">Ward</div>
          <div>{application.ward}</div>

          <div className="text-gray-500">Officer</div>
          <div>{application.officer}</div>

          <div className="text-gray-500">Submission Date</div>
          <div>
            {application.valid_date
              ? new Date(application.valid_date).toLocaleDateString()
              : "Not available"}
          </div>

          <div className="text-gray-500">Consultation End</div>
          <div>
            {application.last_date_consultation_comments
              ? new Date(
                  application.last_date_consultation_comments
                ).toLocaleDateString()
              : "Not available"}
          </div>

          <div className="text-gray-500">Decision Due</div>
          <div>
            {application.decisionDue
              ? new Date(application.decisionDue).toLocaleDateString()
              : "Not available"}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
