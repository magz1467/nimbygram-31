
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
            coordinates: p.geometry?.coordinates
          }))
        });

        const transformedData = properties?.map((item: any) => {
          let coordinates: [number, number] | undefined;
          
          try {
            if (item.geometry?.coordinates && Array.isArray(item.geometry.coordinates)) {
              console.log(`🗺️ Processing geometry for item ${item.id}:`, {
                raw: item.geometry,
                coordinates: item.geometry.coordinates
              });
              
              const coords = Array.isArray(item.geometry.coordinates[0]) 
                ? item.geometry.coordinates[0]
                : item.geometry.coordinates;
              coordinates = [coords[1], coords[0]];
            } else {
              console.log(`⚠️ Invalid geometry format for item ${item.id}:`, item.geometry);
            }
          } catch (err) {
            console.error('⚠️ Error parsing coordinates for item:', item.id, err);
            return null;
          }

          if (!coordinates) {
            console.log(`❌ No valid coordinates for item ${item.id}`);
            return null;
          }

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

