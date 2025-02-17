
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export const ScrapingGeneration = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const checkFunctionExists = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('extract-pdf-urls', {
        method: 'GET'  // Changed from 'OPTIONS' to 'GET'
      });
      
      if (error) {
        console.error('Function existence check failed:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Function deployment check error:', e);
      return false;
    }
  };

  const handleScrapeDocuments = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);

      // Check if function is deployed
      const functionExists = await checkFunctionExists();
      if (!functionExists) {
        toast({
          title: "Error",
          description: "PDF URL extraction function is not properly deployed. Please check the Supabase dashboard.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Processing documents...",
        description: "Scraping PDF URLs from document pages",
      });

      // Add retry logic for the function call
      let retries = 3;
      let data;
      let error;

      while (retries > 0) {
        try {
          console.log(`Attempt ${4-retries} to call extract-pdf-urls function`);
          const result = await supabase.functions.invoke('extract-pdf-urls', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: { 
              timestamp: new Date().toISOString(),
              batch_size: 5 // Reduced batch size for better reliability
            }
          });
          
          data = result.data;
          error = result.error;
          
          if (error) {
            console.error('Function error on attempt', 4-retries, error);
            throw error;
          }
          
          console.log('Function succeeded on attempt', 4-retries, data);
          break;
        } catch (e) {
          console.warn(`Attempt ${4-retries} failed:`, e);
          retries--;
          if (retries === 0) throw e;
          // Exponential backoff
          await delay(1000 * Math.pow(2, 3-retries));
        }
      }

      console.log('PDF URL extraction response:', data);

      if (!data || data.processed === 0) {
        toast({
          title: "No records to process",
          description: "All records have been processed",
        });
        return;
      }

      setProgress(100);
      toast({
        title: "Success!",
        description: `${data.message}. ${data.failed > 0 ? `Failed to process ${data.failed} records.` : ''}`,
      });
    } catch (error: any) {
      console.error('Error scraping documents:', error);
      const errorMessage = error?.message || error?.error_description || "Failed to scrape documents. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">PDF URL Scraping</h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleScrapeDocuments}
          className="w-full sm:w-auto"
          disabled={isProcessing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          {isProcessing ? 'Processing...' : 'Scrape PDF URLs'}
        </Button>
      </div>
      
      {isProcessing && (
        <Progress 
          value={progress} 
          className="h-2" 
        />
      )}
    </div>
  );
};
