
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
        // Only select the id and geometry columns initially to verify the connection
        const { data: properties, error } = await supabase
          .from('property_data_api')
          .select('id, geom')
          .range(0, 99)
          .not('geom', 'is', null);

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
          let coordinates: [number, number] | undefined;
          try {
            if (item.geom?.coordinates && Array.isArray(item.geom.coordinates)) {
              // Handle both Point and other geometry types
              const coords = Array.isArray(item.geom.coordinates[0]) 
                ? item.geom.coordinates[0] 
                : item.geom.coordinates;
              
              coordinates = [
                coords[1],
                coords[0]
              ];
            }
          } catch (err) {
            console.warn('⚠️ Error parsing coordinates for item:', item.id, err);
            return null;
          }

          if (!coordinates) {
            console.warn('⚠️ Missing coordinates for item:', item.id);
            return null;
          }

          return {
            id: item.id || Math.random(),
            title: `Property ${item.id}`, // Simplified title since we don't have description
            address: 'Address pending', // Placeholder since we don't have url_documents
            status: 'Under Review',
            reference: item.id?.toString() || '',
            description: '', // Empty since we don't have this field
            submissionDate: '', // Empty since we don't have last_scraped_at
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

  if (!applications.length && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No properties found. Please try again later.</p>
      </div>
    );
  }

  console.log('🎯 Rendering MapContent with:', {
    applicationCount: applications.length,
    selectedId,
    isMapView: true,
    isLoading,
    firstCoordinates: applications[0]?.coordinates
  });
  
  return (
    <ErrorBoundary>
      <div className="h-screen w-full">
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
      </div>
    </ErrorBoundary>
  );
};

export default MapView;
