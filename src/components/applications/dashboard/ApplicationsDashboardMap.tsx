
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLayout } from "./components/DashboardLayout";
import { useLocation } from "react-router-dom";
import { useApplicationState } from "@/hooks/applications/use-application-state";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const ApplicationsDashboardMap = () => {
  const location = useLocation();
  const searchPostcode = location.state?.postcode;
  const { toast } = useToast();
  const [tableError, setTableError] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  
  const {
    selectedId,
    activeFilters,
    activeSort,
    isMapView,
    postcode,
    coordinates,
    isLoading,
    applications,
    filteredApplications,
    handleMarkerClick,
    handleFilterChange,
    handlePostcodeSelect,
    handleSortChange,
    setIsMapView
  } = useApplicationState(searchPostcode);

  // Log coordinates for debugging
  useEffect(() => {
    if (coordinates) {
      console.log('🌍 Dashboard Map Component received coordinates:', coordinates);
    }
  }, [coordinates]);

  // Select first application when applications are loaded on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && filteredApplications?.length > 0 && !selectedId && !isLoading) {
      handleMarkerClick(filteredApplications[0].id);
    }
  }, [filteredApplications, selectedId, isLoading, handleMarkerClick]);

  // Check if application_votes table exists
  useEffect(() => {
    const checkVotesTable = async () => {
      try {
        const { error } = await supabase
          .from('application_votes')
          .select('count')
          .limit(1);
        
        if (error && error.code === '42P01') {
          // Table doesn't exist
          setTableError(true);
        } else {
          setTableError(false);
        }
      } catch (error) {
        console.error('Error checking votes table:', error);
      }
    };
    
    checkVotesTable();
  }, []);

  const createVotesTable = async () => {
    setIsCreatingTable(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-votes-table');
      
      if (error) {
        console.error('Error creating votes table:', error);
        toast({
          title: "Error",
          description: "Failed to create the votes table. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Votes table has been created successfully."
      });
      
      setTableError(false);
      
      // Refresh the page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error in createVotesTable:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTable(false);
    }
  };

  return (
    <ErrorBoundary>
      {tableError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database setup required</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>The application_votes table does not exist in the database. This is required for the voting feature to work.</p>
            <Button 
              onClick={createVotesTable} 
              disabled={isCreatingTable}
              className="w-full mt-2"
            >
              {isCreatingTable ? "Creating Table..." : "Create Votes Table Now"}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <DashboardLayout
        applications={applications}
        selectedId={selectedId}
        isMapView={isMapView}
        coordinates={coordinates as [number, number]}
        activeFilters={activeFilters}
        activeSort={activeSort}
        postcode={postcode}
        isLoading={isLoading}
        filteredApplications={filteredApplications}
        handleMarkerClick={handleMarkerClick}
        handleFilterChange={handleFilterChange}
        handlePostcodeSelect={handlePostcodeSelect}
        handleSortChange={handleSortChange}
        setIsMapView={(value) => setIsMapView(value)}
      />
    </ErrorBoundary>
  );
};
