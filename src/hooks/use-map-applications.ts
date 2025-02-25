
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { toast } from "@/components/ui/use-toast";

export const useMapApplications = (coordinates?: [number, number] | null) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log('🔍 Starting to fetch property data from crystal_roof...');
      console.log('🌍 Search coordinates:', coordinates);
      setIsLoading(true);
      
      try {
        if (!coordinates) {
          console.log('⚠️ No coordinates provided, skipping fetch');
          setApplications([]);
          return;
        }

        const [lat, lng] = coordinates;
        const { data: properties, error } = await supabase.rpc('properties_within_distance', {
          ref_lat: lat,
          ref_lon: lng,
          radius_meters: 20000 // 20km radius
        });

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
            if (item.geometry?.coordinates) {
              coordinates = [
                parseFloat(item.geometry.coordinates[1]),
                parseFloat(item.geometry.coordinates[0])
              ];
            }
          } catch (err) {
            console.error('⚠️ Error parsing coordinates for item:', item.id, err);
            return null;
          }

          if (!coordinates || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
            console.log(`❌ Invalid coordinates for item ${item.id}`);
            return null;
          }

          const result: Application = {
            id: item.id || Math.random(),
            title: item.short_title || item.description || `Property ${item.id}`,
            address: item.address || 'Address unavailable',
            status: item.status || 'Status unavailable',
            reference: item.id?.toString() || '',
            description: item.description || '',
            submissionDate: item.valid_date || '',
            coordinates: coordinates,
            postcode: item.postcode || 'N/A',
            applicant: item.applicant || 'Not specified',
            decisionDue: item.decision_target_date || '',
            type: item.application_type || 'Planning Application',
            ward: item.ward_name || 'Not specified',
            officer: item.case_officer || 'Not assigned',
            consultationEnd: item.last_date_consultation_comments || '',
            image: item.streetview_url,
            image_map_url: item.image_map_url,
            ai_title: item.ai_title,
            last_date_consultation_comments: item.last_date_consultation_comments,
            valid_date: item.valid_date,
            centroid: item.centroid,
            impact_score: item.impact_score,
            impact_score_details: item.impact_score_details,
            impacted_services: item.impacted_services,
            storybook: item.storybook || null
          };

          return result;
        }).filter((app): app is Application => app !== null);

        if (!transformedData?.length) {
          toast({
            title: "No properties found",
            description: "No properties found within 20km of your location",
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
  }, [coordinates]);

  return { applications, isLoading };
};
