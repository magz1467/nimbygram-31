
import { Application } from "@/types/planning";

/**
 * Enhanced search diagnostics utility to log search performance and results
 */
export const searchDiagnostics = {
  searchHistory: [] as Array<{
    timestamp: string;
    coordinates: [number, number];
    radius: number;
    method?: string;
    duration?: number;
    resultCount?: number;
    error?: any;
  }>,
  
  logSearch: (coordinates: [number, number], radius: number) => {
    console.log(`🔍 [searchDiagnostics] Searching at coordinates [${coordinates[0]}, ${coordinates[1]}] with ${radius}km radius`);
    
    // Validate coordinates
    if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
      console.error('❌ [searchDiagnostics] Invalid coordinates:', coordinates);
    }
    
    // Add to history
    searchDiagnostics.searchHistory.push({
      timestamp: new Date().toISOString(),
      coordinates,
      radius
    });
    
    // Log history size
    console.log(`📊 [searchDiagnostics] Search history size: ${searchDiagnostics.searchHistory.length}`);
  },
  
  logResults: (applications: Application[], method: string, duration: number) => {
    console.log(`📊 [searchDiagnostics] Search completed using ${method} method in ${duration}ms. Found ${applications.length} results.`);
    
    // Update the most recent search entry with results
    if (searchDiagnostics.searchHistory.length > 0) {
      const lastSearch = searchDiagnostics.searchHistory[searchDiagnostics.searchHistory.length - 1];
      lastSearch.method = method;
      lastSearch.duration = duration;
      lastSearch.resultCount = applications.length;
    }
    
    // Log result details if available
    if (applications.length > 0) {
      console.log(`📊 [searchDiagnostics] First result:`, applications[0]);
      
      // Check for distance values
      const distanceValues = applications.map(app => 
        typeof app.distance === 'string' ? parseFloat(app.distance) : app.distance
      ).filter(dist => !isNaN(dist));
      
      if (distanceValues.length > 0) {
        const minDist = Math.min(...distanceValues);
        const maxDist = Math.max(...distanceValues);
        console.log(`📊 [searchDiagnostics] Distance range: ${minDist} to ${maxDist}`);
      }
    }
  },
  
  logError: (error: unknown) => {
    console.error('❌ [searchDiagnostics] Search error:', error);
    
    // Update the most recent search entry with error
    if (searchDiagnostics.searchHistory.length > 0) {
      const lastSearch = searchDiagnostics.searchHistory[searchDiagnostics.searchHistory.length - 1];
      lastSearch.error = error;
    }
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('❌ [searchDiagnostics] Error message:', error.message);
      console.error('❌ [searchDiagnostics] Error stack:', error.stack);
    }
  },
  
  getSearchHistory: () => {
    return searchDiagnostics.searchHistory;
  },
  
  clearSearchHistory: () => {
    searchDiagnostics.searchHistory = [];
    console.log('🧹 [searchDiagnostics] Search history cleared');
  },
  
  getSummary: () => {
    const history = searchDiagnostics.searchHistory;
    return {
      totalSearches: history.length,
      successfulSearches: history.filter(h => h.resultCount !== undefined && !h.error).length,
      failedSearches: history.filter(h => h.error).length,
      averageDuration: history.filter(h => h.duration).reduce((sum, h) => sum + (h.duration || 0), 0) / 
                      history.filter(h => h.duration).length || 0,
      totalResults: history.reduce((sum, h) => sum + (h.resultCount || 0), 0)
    };
  }
};

// Create a global variable to access diagnostics from console
(window as any).searchDiagnostics = searchDiagnostics;

