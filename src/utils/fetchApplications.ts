
import { searchApplications } from "@/services/search/search-service";
import { Application } from "@/types/planning";

export const fetchApplications = async (
  coordinates: [number, number] | null, 
  searchTerm?: string
): Promise<Application[]> => {
  console.log('🔍 fetchApplications called with:', { coordinates, searchTerm });
  
  if (!coordinates && !searchTerm) {
    console.log('❌ No search parameters provided to fetchApplications');
    return [];
  }
  
  // Log search details to help with debugging
  if (searchTerm) {
    console.log(`🔍 Performing search with text: "${searchTerm}"`);
  }
  if (coordinates) {
    console.log(`🔍 Performing search with coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
  }
  
  try {
    const results = await searchApplications(coordinates, searchTerm);
    console.log(`✅ Search returned ${results.length} applications`);
    
    // For text-only searches, check if we have results in the right location
    if (!coordinates && searchTerm && results.length > 0) {
      console.log('📊 Top 3 text search results:');
      results.slice(0, 3).forEach((app, i) => {
        console.log(`  [${i+1}] ID: ${app.id}, Address: ${app.address || 'No address'}, Ward: ${app.ward || 'No ward'}`);
      });
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error in fetchApplications:', error);
    throw error;
  }
};
