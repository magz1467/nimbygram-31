
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

        // Build PostGIS query to filter by distance (20km)
        const [lat, lng] = coordinates;
        const radius = 20000; // 20km in meters
        
        console.log('📍 Querying with parameters:', {
          ref_lat: lat,
          ref_lon: lng,
          radius_meters: radius
        });

        // Call the RPC function directly
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

        console.log('📦 Raw properties response:', {
          count: properties?.length || 0,
          firstRecord: properties?.[0],
          coordinatesSample: properties?.slice(0, 5).map((p: any) => ({
            id: p.id,
            address: p.address,
            coordinates: p.geometry?.coordinates,
            raw_geometry: p.geometry
          }))
        });

        const transformedData = properties?.map((item: any) => {
          let coordinates: [number, number] | undefined;
          
          try {
            if (item.geometry?.coordinates) {
              // PostGIS returns coordinates in [longitude, latitude] order
              // We need to swap them to [latitude, longitude] for Leaflet
              coordinates = [
                parseFloat(item.geometry.coordinates[1]), // latitude
                parseFloat(item.geometry.coordinates[0])  // longitude
              ];
              
              console.log(`🗺️ Processing coordinates for item ${item.id}:`, {
                original: item.geometry.coordinates,
                transformed: coordinates
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

        console.log(`📊 Found ${transformedData?.length || 0} valid applications out of ${properties?.length || 0} total records`);
        console.log('📍 Sample of transformed applications:', transformedData?.slice(0, 3));
        
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
