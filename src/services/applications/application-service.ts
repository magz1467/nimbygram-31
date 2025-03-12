import { supabase } from '@/integrations/supabase/client';
import { Application } from '@/types/planning';

export const fetchApplicationsByLocation = async (
  latitude: number, 
  longitude: number, 
  radius: number = 1,
  filters: Record<string, string> = {}
): Promise<any[]> => {
  try {
    const filtersObject = buildFiltersObject(filters);
    
    let query = supabase
      .from('applications')
      .select('*')
      .range(0, 200)
      .order('application_id', { ascending: false });
    
    // Apply filters from the filters object
    for (const key in filtersObject) {
      if (filtersObject.hasOwnProperty(key) && filtersObject[key]) {
        query = query.eq(key, filtersObject[key]);
      }
    }

    // Use PostGIS functions for spatial filtering
    const distance = radius * 1000; // Convert radius from kilometers to meters
    query = query.rpc('get_nearby_applications', {
      latitude: latitude,
      longitude: longitude,
      distance: distance
    });
    
    const { data: applicationsData, error } = await query;
    
    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
    
    if (!applicationsData || !Array.isArray(applicationsData)) {
      console.error('Invalid response format:', applicationsData);
      return [];
    }
    
    return applicationsData;
  } catch (error) {
    console.error('Error fetching applications by location:', error);
    throw error;
  }
};

export const fetchApplicationById = async (applicationId: string): Promise<Application | null> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error) {
      console.error('Error fetching application by ID:', error);
      return null;
    }

    return data as Application;
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    return null;
  }
};

export const transformApplication = (application: any): any => {
  if (!application) return null;
  
  try {
    const transformedApp = { ...application };
    
    return transformedApp;
  } catch (error) {
    console.error('Error transforming application:', error);
    return application;
  }
};

export const buildFiltersObject = (filters: any): Record<string, any> => {
  if (!filters) return {};
  if (typeof filters === 'string') {
    try {
      return JSON.parse(filters);
    } catch (e) {
      console.error('Invalid filter string:', filters);
      return {};
    }
  }
  return filters;
};
