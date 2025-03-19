
import { Card } from "@/components/ui/card";
import { AlertCircle, MinusCircle, ChevronDown } from "lucide-react";
import { Application } from "@/types/planning";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { useState } from "react";

interface ExpectedImpactAreasProps {
  application?: Application;
  impactedServices?: Application['impacted_services'];
}

export const ExpectedImpactAreas = ({ application, impactedServices }: ExpectedImpactAreasProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!application) return null;

  // Default services if none provided
  const services = impactedServices || application.impacted_services || {
    "Schools": { impact: "negative" as const, details: "May increase pressure on local schools" },
    "Health": { impact: "negative" as const, details: "May increase pressure on health services" },
    "Roads": { impact: "neutral" as const, details: "No significant impact expected" },
    "Public Transport": { impact: "neutral" as const, details: "No significant impact expected" },
    "Utilities": { impact: "neutral" as const, details: "No significant impact expected" },
    "Community Services": { impact: "positive" as const, details: "May support these services" }
  };

  // Count impacts by type with proper type checking
  const impactCounts = Object.values(services || {}).reduce((acc, service) => {
    const impact = service?.impact || 'neutral';
    acc[impact] = (acc[impact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <AlertCircle className="w-4 h-4 text-primary" />;
      case 'negative':
        return <AlertCircle className="w-4 h-4 text-[#ea384c]" />;
      default:
        return <MinusCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getImpactClass = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'bg-primary/5 p-2 rounded-lg';
      case 'negative':
        return 'bg-[#ea384c]/5 p-2 rounded-lg';
      default:
        return 'p-2';
    }
  };

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Impacted Services</h3>
            <p className="text-sm text-gray-500">
              {impactCounts.positive || 0} services may improve, {impactCounts.negative || 0} services may face added pressure
            </p>
          </div>
          <CollapsibleTrigger className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(services || {}).map(([name, serviceInfo]) => (
              <div 
                key={name} 
                className={`flex items-start gap-2 group transition-all ${getImpactClass(serviceInfo?.impact || 'neutral')}`}
                title={serviceInfo?.details || ''}
              >
                {getImpactIcon(serviceInfo?.impact || 'neutral')}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {serviceInfo?.details || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="w-3 h-3 text-primary" />
              <span>May support these services</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <AlertCircle className="w-3 h-3 text-[#ea384c]" />
              <span>May increase pressure on services</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <MinusCircle className="w-3 h-3 text-gray-400" />
              <span>No significant impact expected</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
