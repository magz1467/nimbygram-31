
import { useState, useEffect, useMemo } from "react";
import { useApplicationsData } from "@/components/applications/dashboard/hooks/useApplicationsData";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { SortType } from "@/types/application-types";
import { useURLState } from "./use-url-state";
import { useSelectionState } from "./use-selection-state";
import { useFilterState } from "./use-filter-state";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";
import { Application } from "@/types/planning";

export const useDashboardState = () => {
  const { 
    initialPostcode, 
    initialTab, 
    initialFilter,
    initialApplicationId,
    updateURLParams 
  } = useURLState();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use the handleMarkerClick from useSelectionState
  const { selectedId, handleMarkerClick } = useSelectionState(initialApplicationId);
  const { activeFilters, handleFilterChange } = useFilterState(initialFilter);
  const [activeSort, setActiveSort] = useState<SortType>(null);
  const [isMapView, setIsMapView] = useState(true);
  const [postcode, setPostcode] = useState(initialPostcode || '');
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(postcode);
  const { 
    applications, 
    isLoading: isLoadingApps, 
    error
  } = useApplicationsData({ postcode: postcode });

  // Function to manually fetch applications in radius
  const fetchApplicationsInRadius = async (coords: [number, number], radius: number) => {
    console.log('Fetching applications at coordinates:', coords, 'with radius:', radius);
    // This is just a placeholder - the actual fetching is handled by useApplicationsData
    setSearchPoint(coords);
  };

  // Show error toast if there's an error fetching applications
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading applications",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (isSearching && !coordinates) {
      toast({
        title: "Location Error",
        description: "We couldn't find that location. Please check the postcode and try again.",
        variant: "destructive",
      });
      setIsSearching(false);
      navigate("/");
      return;
    }

    try {
      updateURLParams({
        postcode,
        tab: initialTab,
        filter: activeFilters.status,
        applicationId: selectedId
      });
    } catch (error) {
      console.error('URL update error:', error);
      toast({
        title: "Navigation Error",
        description: "There was a problem updating the page URL. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [postcode, initialTab, activeFilters.status, selectedId, updateURLParams, coordinates, isSearching, navigate, toast]);

  const logSearch = async (loadTime: number) => {
    try {
      console.log('Logging search from useDashboardState:', {
        postcode,
        status: initialTab,
        loadTime,
        timestamp: new Date().toISOString()
      });

      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from('Searches').insert({
        'Post Code': postcode,
        'Status': initialTab,
        'User_logged_in': !!session?.user,
        'load_time': loadTime
      });

      if (error) {
        console.error('Search logging error:', error);
        toast({
          title: "Analytics Error",
          description: "Your search was processed but we couldn't log it. This won't affect your results.",
          variant: "default",
        });
      } else {
        console.log('Search logged successfully from useDashboardState');
      }
    } catch (error) {
      console.error('Search logging error:', error);
    }
  };

  const handlePostcodeSelect = async (newPostcode: string) => {
    if (!newPostcode) {
      toast({
        title: "Invalid Postcode",
        description: "Please enter a valid postcode to search.",
        variant: "destructive",
      });
      return;
    }
    setIsSearching(true);
    setSearchStartTime(Date.now());
    setPostcode(newPostcode);
  };

  const handleSortChange = (sortType: SortType) => {
    console.log('Changing sort to:', sortType);
    setActiveSort(sortType);
  };

  // Memoize these computed values
  const isInitialSearch = useMemo(() => !searchPoint && coordinates, [searchPoint, coordinates]);
  const isNewSearch = useMemo(() => 
    searchPoint && coordinates && 
    (searchPoint[0] !== coordinates[0] || searchPoint[1] !== coordinates[1]), 
    [searchPoint, coordinates]
  );

  useEffect(() => {
    if (!coordinates) return;
    
    if (isInitialSearch || isNewSearch) {
      console.log('Fetching applications with coordinates:', coordinates);
      try {
        const [lat, lng] = coordinates;
        const tuple: [number, number] = [lat, lng];
        setSearchPoint(tuple);
        fetchApplicationsInRadius(tuple, 1000);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Failed",
          description: "There was a problem fetching planning applications. Please try again or contact support if the issue persists.",
          variant: "destructive",
        });
        setIsSearching(false);
      }
    }
  }, [coordinates, isInitialSearch, isNewSearch]);

  useEffect(() => {
    if (searchStartTime && !isLoadingApps && !isLoadingCoords) {
      const loadTime = (Date.now() - searchStartTime) / 1000;
      console.log('Search completed, logging with load time:', loadTime);
      logSearch(loadTime);
      setSearchStartTime(null);
      setIsSearching(false);
    }
  }, [isLoadingApps, isLoadingCoords, searchStartTime, postcode]);

  const safeApplications = applications || [];
  const filteredApplications = useFilteredApplications(
    safeApplications,
    activeFilters,
    activeSort
  );

  // Calculate status counts manually
  const statusCounts = useMemo(() => {
    const counts = {
      'Under Review': 0,
      'Approved': 0,
      'Declined': 0,
      'Other': 0
    };

    safeApplications.forEach(app => {
      if (app.status === 'Under Review') counts['Under Review']++;
      else if (app.status === 'Approved') counts['Approved']++;
      else if (app.status === 'Declined') counts['Declined']++;
      else counts['Other']++;
    });

    return counts;
  }, [safeApplications]);

  return {
    selectedId,
    activeFilters,
    activeSort,
    isMapView,
    setIsMapView,
    postcode,
    coordinates,
    isLoading: isLoadingCoords || isLoadingApps,
    applications: safeApplications,
    filteredApplications,
    statusCounts,
    handleMarkerClick,
    handleFilterChange,
    handlePostcodeSelect,
    handleSortChange,
    fetchApplicationsInRadius
  };
};
