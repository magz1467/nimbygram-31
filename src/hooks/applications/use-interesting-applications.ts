
import { useState, useCallback } from "react";
import { Application } from "@/types/planning";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useInterestingApplications = (hasSearched: boolean) => {
  const [interestingApplications, setInterestingApplications] = useState<Application[]>([]);
  const [isLoadingInteresting, setIsLoadingInteresting] = useState(false);
  const { toast } = useToast();

  const fetchInterestingApplications = useCallback(async () => {
    if (hasSearched) {
      return;
    }

    console.log('🌟 Fetching interesting applications...');
    setIsLoadingInteresting(true);
    
    try {
      const { data, error } = await supabase
        .from('crystal_roof')
        .select('*')
        .not('storybook', 'is', null)
        .order('id', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching interesting applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch interesting applications",
          variant: "destructive",
        });
        return;
      }

      console.log('📊 Fetched interesting applications:', data?.length);
      setInterestingApplications(data || []);
    } catch (error) {
      console.error('Failed to fetch interesting applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch interesting applications",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInteresting(false);
    }
  }, [hasSearched, toast]);

  return {
    interestingApplications,
    isLoadingInteresting,
    fetchInterestingApplications
  };
};

