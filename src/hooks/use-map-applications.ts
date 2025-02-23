
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { toast } from "@/components/ui/use-toast";

export const useMapApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log('🔍 Starting to fetch property data from crystal_roof...');
      setIsLoading(true);
      
      try {
        // Get total count first
        const { count, error: countError } = await supabase
          .from('crystal_roof')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          throw countError;
        }

        console.log(`📊 Total records in database: ${count}`);

        // Now fetch all records with a higher limit
        const { data: properties, error } = await supabase
          .from('crystal_roof')
          .select('id, geometry, description, short_title, address')
          .not('geometry', 'is', null)
          .limit(10000); // Increased from default 1000 to 10000

        if (error) {
          console.error('❌ Error fetching property data:', error);
          toast({
            title: "Error loading properties",
            description: "Please try again later",
            variant: "destructive"
          });
          return;
        }

        const transformedData = properties?.map((item: any) => {
          let coordinates: [number, number] | undefined;
          try {
            if (item.geometry?.coordinates && Array.isArray(item.geometry.coordinates)) {
              const coords = Array.isArray(item.geometry.coordinates[0]) 
                ? item.geometry.coordinates[0]
                : item.geometry.coordinates;
              coordinates = [coords[1], coords[0]];
            }
          } catch (err) {
            console.error('⚠️ Error parsing coordinates for item:', item.id, err);
            return null;
          }

          if (!coordinates) return null;

          const result: Application = {
            id: item.id || Math.random(),
            title: item.short_title || item.description || `Property ${item.id}`,
            address: item.address || 'Address unavailable',
            status: 'Status unavailable',
            reference: item.id?.toString() || '',
            description: item.description || '',
            submissionDate: '',
            coordinates: coordinates,
            postcode: 'N/A',
            applicant: 'Not specified',
            decisionDue: '',
            type: 'Planning Application',
            ward: 'Not specified',
            officer: 'Not assigned',
            consultationEnd: '',
            image: undefined,
            image_map_url: undefined,
            ai_title: undefined,
            last_date_consultation_comments: undefined,
            valid_date: undefined,
            centroid: undefined,
            impact_score: null,
            impact_score_details: undefined,
            impacted_services: undefined
          };

          return result;
        }).filter((app): app is Application => app !== null);

        console.log(`📊 Found ${transformedData?.length || 0} valid applications out of ${properties?.length || 0} total records`);
        
        if (!transformedData?.length) {
          toast({
            title: "No properties found",
            description: "No properties with valid coordinates were found",
            variant: "destructive"
          });
        }

        setApplications(transformedData || []);
      } catch (error) {
        console.error('💥 Error in fetchPropertyData:', error);
        toast({
          title: "Error loading properties",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, []);

  return { applications, isLoading };
};
