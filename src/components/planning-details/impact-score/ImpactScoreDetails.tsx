import { ScrollArea } from "@/components/ui/scroll-area";
import { ImpactCategoryCard } from "./ImpactCategory";
import { ImpactList } from "./ImpactList";
import { ImpactScoreData, CategoryScore } from "./types";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ImpactScoreBreakdownProps {
  details: ImpactScoreData | null;
}

export const ImpactScoreBreakdown: React.FC<ImpactScoreBreakdownProps> = ({ details }) => {
  console.log('ImpactScoreBreakdown - Received details:', details);

  if (!details) {
    console.log('ImpactScoreBreakdown - No details provided');
    return null;
  }

  // Calculate category scores from detailed breakdowns
  const categoryScores: Record<string, CategoryScore> = {};
  
  if (details.Environmental) {
    const envScore = Object.values(details.Environmental).reduce((a, b) => a + b, 0);
    categoryScores.Environmental = {
      score: envScore / Object.keys(details.Environmental).length,
      details: `Based on analysis of ${Object.entries(details.Environmental)
        .map(([key, value]) => `${key.replace(/_/g, ' ')} (${value})`)
        .join(', ')}.`
    };
  }

  if (details.Social) {
    const socialScore = Object.values(details.Social).reduce((a, b) => a + b, 0);
    categoryScores.Social = {
      score: socialScore / Object.keys(details.Social).length,
      details: `Based on analysis of ${Object.entries(details.Social)
        .map(([key, value]) => `${key.replace(/_/g, ' ')} (${value})`)
        .join(', ')}.`
    };
  }

  // Order categories for consistent display
  const orderedCategories = ['Environmental', 'Social', 'Infrastructure', 'Economic'];
  const otherCategories = Object.keys(categoryScores).filter(
    cat => !orderedCategories.includes(cat)
  );

  return (
    <ScrollArea className="h-[500px] w-full rounded-md border p-6">
      <div className="space-y-6">
        {/* Impact Categories */}
        <div className="space-y-4">
          {orderedCategories.map(category => {
            if (!categoryScores[category]) return null;
            return (
              <ImpactCategoryCard 
                key={category}
                category={category}
                scoreData={categoryScores[category]}
              />
            );
          })}
          {otherCategories.map(category => {
            if (!categoryScores[category]) return null;
            return (
              <ImpactCategoryCard 
                key={category}
                category={category}
                scoreData={categoryScores[category]}
              />
            );
          })}
        </div>

        {/* Impacted Services Analysis */}
        {details.impacted_services && Object.keys(details.impacted_services).length > 0 && (
          <>
            <Separator className="my-6" />
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Impact on Local Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(details.impacted_services).map(([service, { impact, details }]) => (
                  <div 
                    key={service} 
                    className={`flex items-start gap-3 p-4 rounded-lg transition-all ${
                      impact === 'positive' ? 'bg-primary/5 text-primary-dark' : 
                      impact === 'negative' ? 'bg-destructive/5 text-destructive' : 
                      'bg-muted/5 text-muted-foreground'
                    }`}
                    title={details}
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium">{service}</p>
                      <p className="text-sm opacity-90">
                        {details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2 text-primary">
                  <AlertCircle className="w-4 h-4" />
                  <span>Supports services</span>
                </div>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>Increases pressure</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>Neutral impact</span>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Key Concerns and Recommendations */}
        <Separator className="my-6" />
        <div className="space-y-6">
          <ImpactList title="Key Concerns" items={details.key_concerns} />
          <ImpactList title="Recommendations" items={details.recommendations} />
        </div>
      </div>
    </ScrollArea>
  );
};