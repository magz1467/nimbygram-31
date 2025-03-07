
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const ImpactScoreGeneration = () => {
  const { toast } = useToast();
  const [isGeneratingScores, setIsGeneratingScores] = useState(false);

  const handleGenerateScores = async () => {
    try {
      setIsGeneratingScores(true);
      
      toast({
        title: "Impact score generation removed",
        description: "This feature has been disabled.",
        variant: "destructive"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Feature has been disabled",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingScores(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={handleGenerateScores}
          className="flex-1 md:flex-none"
          disabled={true}
          variant="secondary"
        >
          Impact Score Generation Disabled
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        This feature has been temporarily disabled.
      </p>
    </div>
  );
};
