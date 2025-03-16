
import { useState, useCallback, useEffect } from "react";
import { Application } from "@/types/planning";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { transformApplicationsData } from "@/utils/transforms/application-transformer";

export const useInterestingApplications = (hasSearched: boolean) => {
  const [interestingApplications, setInterestingApplications] = useState<Application[]>([]);
  const [isLoadingInteresting, setIsLoadingInteresting] = useState(false);
  const { toast } = useToast();

  // Debug effect to check if applications have storybook data
  useEffect(() => {
    if (interestingApplications.length > 0) {
      console.log(`🧐 Checking ${interestingApplications.length} interesting applications for storybook content`);
      const withStorybook = interestingApplications.filter(app => !!app.storybook);
      console.log(`Found ${withStorybook.length} applications with storybook content`);
      
      if (withStorybook.length > 0) {
        console.log('Example storybook content:', withStorybook[0].storybook?.substring(0, 100) + '...');
      }
    }
  }, [interestingApplications]);

  const fetchInterestingApplications = useCallback(async () => {
    if (hasSearched) {
      return;
    }

    console.log('🌟 Fetching interesting applications...');
    setIsLoadingInteresting(true);
    
    try {
      // Explicitly select all fields including storybook field with a "*" wildcard
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
      console.log('Raw data first item:', data?.[0]);
      
      // Log if the first result has storybook data
      if (data && data.length > 0) {
        console.log('First application has storybook:', Boolean(data[0].storybook));
        if (data[0].storybook) {
          console.log('Storybook preview:', data[0].storybook.substring(0, 100) + '...');
        }
      }
      
      // Use the transformer function to properly handle the data
      const transformedApplications = transformApplicationsData(data || []);
      setInterestingApplications(transformedApplications);
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
