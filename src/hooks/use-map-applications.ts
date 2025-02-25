
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { toast } from "@/components/ui/use-toast";
import { calculateDistance } from "@/utils/distance";

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
        console.log(`📍 Fetching properties within 20km of [${lat}, ${lng}]`);
        
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

        console.log(`✨ Received ${properties?.length || 0} properties from database`);

        const transformedData = properties?.map((item: any) => {
          let coords: [number, number] | undefined;
          
          try {
            if (item.geometry?.coordinates) {
              coords = [
                parseFloat(item.geometry.coordinates[1]),
                parseFloat(item.geometry.coordinates[0])
              ];
            }
          } catch (err) {
            console.error('⚠️ Error parsing coordinates for item:', item.id, err);
            return null;
          }

          if (!coords || isNaN(coords[0]) || isNaN(coords[1])) {
            console.log(`❌ Invalid coordinates for item ${item.id}`);
            return null;
          }

          // Handle streetview_url - ensure it's a string or null
          const streetview_url = typeof item.streetview_url === 'string' ? 
            item.streetview_url : 
            (item.streetview_url?.value || null);

          const result: Application = {
            id: item.id || Math.random(),
            title: item.short_title || item.description || `Property ${item.id}`,
            address: item.address || 'Address unavailable',
            status: item.status || 'Status unavailable',
            reference: item.id?.toString() || '',
            description: item.description || '',
            submissionDate: item.valid_date || '',
            coordinates: coords,
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
            storybook: item.storybook || null,
            streetview_url
          };

          return result;
        }).filter((app): app is Application => app !== null);

        console.log('✅ Transformed applications:', {
          total: transformedData?.length,
          withStorybook: transformedData?.filter(app => app.storybook)?.length,
          sampleApplication: transformedData?.[0] ? {
            id: transformedData[0].id,
            streetview_url: transformedData[0].streetview_url,
            type: typeof transformedData[0].streetview_url
          } : null
        });

        // Sort applications by distance from search coordinates
        const sortedData = transformedData.sort((a, b) => {
          if (!a.coordinates || !b.coordinates) return 0;
          const distanceA = calculateDistance(coordinates, a.coordinates);
          const distanceB = calculateDistance(coordinates, b.coordinates);
          return distanceA - distanceB;
        });

        setApplications(sortedData || []);

        if (!transformedData?.length) {
          toast({
            title: "No properties found",
            description: "No properties found within 20km of your location",
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('💥 Error in fetchPropertyData:', error);
        toast({
          title: "Error loading properties",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        console.log('🏁 Property fetch completed');
      }
    };

    fetchPropertyData();
  }, [coordinates]);

  return { applications, isLoading };
};

