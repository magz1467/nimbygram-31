
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImpactCategoryCard } from "./ImpactCategory";
import { ImpactList } from "./ImpactList";
import { ImpactScoreData, CategoryScore } from "./types";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ImpactScoreDetailsProps {
  application: any;
}

const ImpactScoreDetails: React.FC<ImpactScoreDetailsProps> = ({ application }) => {
  console.log('ImpactScoreDetails - Received application:', application);
  
  // This component is now simplified as we're removing the impact score functionality
  // We're just returning null instead of rendering complex UI
  return null;
};

export default ImpactScoreDetails;

export const ImpactScoreBreakdown: React.FC<{details: ImpactScoreData | null}> = ({ details }) => {
  // This component is also simplified as we're removing the impact score functionality
  return null;
};
