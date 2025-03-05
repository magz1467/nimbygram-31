
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/distance";

const fetchApplications = async (coordinates: [number, number] | null) => {
  if (!coordinates) return [];
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  // Calculate bounds for a radius search (approximately 20km)
  const [lat, lng] = coordinates;
  const radius = 20; // km
  const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
  const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
  
  const latMin = lat - latDiff;
  const latMax = lat + latDiff;
  const lngMin = lng - lngDiff;
  const lngMax = lng + lngDiff;
  
  console.log('🔍 Searching within bounds:', { latMin, latMax, lngMin, lngMax });
  
  // Query crystal_roof table with geospatial filter
  const { data, error } = await supabase
    .from('crystal_roof')
    .select('*')
    .or(`geom->coordinates->1.gte.${latMin},geom->coordinates->1.lte.${latMax}`)
    .or(`geom->coordinates->0.gte.${lngMin},geom->coordinates->0.lte.${lngMax}`)
    .order('id');

  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }

  // Transform the data to ensure correct types and values
  const transformedData = data.map(app => ({
    ...app,
    title: app.description || app.title || `Application ${app.id}`,
    coordinates: app.geom?.coordinates ? [
      parseFloat(app.geom.coordinates[1]),
      parseFloat(app.geom.coordinates[0])
    ] as [number, number] : undefined
  })) || [];
  
  // Sort by distance from search coordinates
  return transformedData.sort((a, b) => {
    if (!a.coordinates || !b.coordinates) return 0;
    const distanceA = calculateDistance(coordinates, a.coordinates);
    const distanceB = calculateDistance(coordinates, b.coordinates);
    return distanceA - distanceB;
  });
};

export const useSearchState = (initialPostcode = '') => {
  const location = useLocation();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(postcode);

  const { 
    data: applications = [], 
    isLoading: isLoadingApps
  } = useQuery({
    queryKey: ['applications', coordinates ? coordinates.join(',') : null],
    queryFn: () => fetchApplications(coordinates),
    enabled: !!coordinates,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  // Handle search state from URL - only on mount
  useEffect(() => {
    const searchState = location.state;
    if (searchState?.searchType === 'postcode' && searchState?.searchTerm && !postcode) {
      console.log('📍 Setting initial postcode from URL state:', searchState.searchTerm);
      setPostcode(searchState.searchTerm);
      setIsSearching(true);
      setSearchStartTime(Date.now());
    }
  }, [location.state, postcode]);  // Added location.state dependency

  const handlePostcodeSelect = useCallback((newPostcode: string) => {
    if (!newPostcode) {
      toast({
        title: "Invalid Postcode",
        description: "Please enter a valid postcode to search.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🔍 Starting new postcode search:', newPostcode);
    setIsSearching(true);
    setPostcode(newPostcode);
    setSearchStartTime(Date.now());
    // Reset any previous search points to ensure fresh search
    setSearchPoint(null);
  }, [toast]);

  return {
    postcode,
    coordinates,
    isLoadingCoords,
    isLoadingApps,
    applications,
    isSearching,
    setIsSearching,
    handlePostcodeSelect,
    searchStartTime,
    setSearchStartTime,
    searchPoint,
    setSearchPoint
  };
};
