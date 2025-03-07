import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ImpactScoreGeneration = () => {
  const { toast } = useToast();
  const [isGeneratingScores, setIsGeneratingScores] = useState(false);
  const [scoreBatchSize, setScoreBatchSize] = useState(50);

  const handleGenerateScores = async () => {
    try {
      setIsGeneratingScores(true);
      console.log('[Impact Scores] Starting generation process...');
      
      toast({
        title: "Generating impact scores",
        description: `This may take a few minutes for up to ${scoreBatchSize} applications`,
      });

      console.log('[Impact Scores] Invoking edge function with batch size:', scoreBatchSize);
      const { data, error } = await supabase.functions.invoke('generate-impact-scores', {
        body: { limit: scoreBatchSize }
      });

      if (error) {
        console.error('[Impact Scores] Error response from edge function:', error);
        throw new Error(`Failed to generate scores: ${error.message}`);
      }

      console.log('[Impact Scores] Generation result:', data);
      
      // Query the database to verify results
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .not('impact_score', 'is', null);
      
      console.log('[Impact Scores] Total applications with impact scores:', count);

      // Query recently processed applications
      const { data: recentScores } = await supabase
        .from('applications')
        .select('application_id, impact_score, impact_score_details')
        .not('impact_score', 'is', null)
        .order('application_id', { ascending: false })
        .limit(5);

      console.log('[Impact Scores] Recent scores generated:', recentScores);
      
      toast({
        title: "Success!",
        description: `${data.message}. Total applications with impact scores: ${count}`,
      });

    } catch (error) {
      console.error('[Impact Scores] Error generating scores:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate impact scores. Please try again.",
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
          onClick={() => {
            setScoreBatchSize(50);
            handleGenerateScores();
          }}
          className="flex-1 md:flex-none"
          disabled={isGeneratingScores}
        >
          {isGeneratingScores && scoreBatchSize === 50 ? "Generating Scores..." : "Generate 50 Impact Scores"}
        </Button>

        <Button
          onClick={() => {
            setScoreBatchSize(100);
            handleGenerateScores();
          }}
          className="flex-1 md:flex-none"
          disabled={isGeneratingScores}
          variant="secondary"
        >
          {isGeneratingScores && scoreBatchSize === 100 ? "Generating Scores..." : "Generate 100 Impact Scores"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Click to generate environmental impact scores for applications that don't have them yet. Choose between processing 50 or 100 applications at a time.
      </p>
    </div>
  );
};