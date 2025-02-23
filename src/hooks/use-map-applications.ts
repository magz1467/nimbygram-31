
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

        // Get the raw response first to check the structure
        const [lat, lng] = coordinates;
        const { data: rawData, error: rawError } = await supabase
          .from('crystal_roof')
          .select('*');

        console.log('📊 Raw query response:', {
          totalRecords: rawData?.length,
          firstRecord: rawData?.[0],
          wendoverCount: rawData?.filter(r => r.ward_name?.includes('Wendover')).length,
          uniqueWards: [...new Set(rawData?.map(r => r.ward_name))]
        });

        if (rawError) {
          console.error('❌ Error fetching raw data:', rawError);
          return;
        }

        // Now proceed with the distance-filtered query
        const radius = 20000; // 20km in meters
        
        console.log('📍 Querying with parameters:', {
          ref_lat: lat,
          ref_lon: lng,
          radius_meters: radius
        });

        // Call the RPC function
        const { data: properties, error } = await supabase.rpc('properties_within_distance', {
          ref_lat: lat,
          ref_lon: lng,
          radius_meters: radius
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

        // Log raw properties data for debugging
        console.log('📦 Raw properties response:', properties);
        console.log('📊 Total properties returned:', properties?.length);
        console.log('🏠 Properties in Wendover:', 
          properties?.filter((p: any) => p.ward_name?.includes('Wendover')).length
        );

        // Log first few Wendover properties
        const wendoverProperties = properties?.filter((p: any) => p.ward_name?.includes('Wendover'));
        console.log('🏘️ First 5 Wendover properties:', wendoverProperties?.slice(0, 5));

        const transformedData = properties?.map((item: any) => {
          let coordinates: [number, number] | undefined;
          
          try {
            if (item.geometry?.coordinates) {
              coordinates = [
                parseFloat(item.geometry.coordinates[1]), // latitude
                parseFloat(item.geometry.coordinates[0])  // longitude
              ];
              
              console.log(`🗺️ Processing coordinates for item ${item.id} (${item.ward_name}):`, {
                original: item.geometry.coordinates,
                transformed: coordinates,
                ward: item.ward_name
              });
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
            image: item.image,
            image_map_url: item.image_map_url,
            ai_title: item.ai_title,
            last_date_consultation_comments: item.last_date_consultation_comments,
            valid_date: item.valid_date,
            centroid: item.centroid,
            impact_score: item.impact_score,
            impact_score_details: item.impact_score_details,
            impacted_services: item.impacted_services
          };

          return result;
        }).filter((app): app is Application => app !== null);

        console.log('📊 Post-transform statistics:', {
          totalApplications: transformedData?.length,
          wendoverApplications: transformedData?.filter(app => app.ward?.includes('Wendover')).length,
          sampleWendover: transformedData?.filter(app => app.ward?.includes('Wendover')).slice(0, 3)
        });

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

