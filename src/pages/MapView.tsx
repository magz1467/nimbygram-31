
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MapContent } from "@/components/map/MapContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { toast } from "@/components/ui/use-toast";

const MapView = () => {
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log('🔍 Starting to fetch property data...');
      setIsLoading(true);
      
      try {
        const { data: properties, error } = await supabase
          .from('property_data_api')
          .select('*');

        if (error) {
          console.error('❌ Error fetching property data:', error);
          toast({
            title: "Error loading properties",
            description: "Please try again later",
            variant: "destructive"
          });
          return;
        }

        console.log('📦 Received property data:', properties?.length || 0, 'records');

        // Transform the property data to match the Application type
        const transformedData = properties?.map((item: any) => {
          console.log('🔄 Processing item:', item.id, 'Location:', item.geom);
          
          let coordinates: [number, number] | undefined;
          try {
            if (item.geom && typeof item.geom === 'object') {
              coordinates = [
                item.geom.coordinates[1],
                item.geom.coordinates[0]
              ];
            }
          } catch (err) {
            console.warn('⚠️ Error parsing coordinates for item:', item.id, err);
          }

          if (!coordinates) {
            console.warn('⚠️ Missing coordinates for item:', item.id);
            return null;
          }

          return {
            id: item.id || Math.random(),
            title: item.description || 'No description available',
            address: item.url_documents || 'No address available',
            status: 'Under Review',
            reference: item.id?.toString() || '',
            description: item.description || '',
            submissionDate: item.last_scraped_at || '',
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
          } as Application;
        }).filter((app): app is Application => app !== null);

        console.log('✨ Transformed data:', {
          totalTransformed: transformedData?.length,
          firstItem: transformedData?.[0],
          hasCoordinates: transformedData?.some(app => app.coordinates)
        });

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
  
  return (
    <ErrorBoundary>
      <MapContent 
        applications={applications}
        selectedId={selectedId}
        coordinates={[51.5074, -0.1278]} // Default to London coordinates
        isMobile={isMobile}
        isMapView={true}
        onMarkerClick={(id) => {
          console.log('🖱️ Marker clicked:', id);
          setSelectedId(id);
        }}
        isLoading={isLoading}
        postcode="SW1A 1AA" // Default London postcode
      />
    </ErrorBoundary>
  );
};

export default MapView;
