
import { Application } from "@/types/planning";

/**
 * Simple search diagnostics utility to log search performance and results
 */
export const searchDiagnostics = {
  logSearch: (coordinates: [number, number], radius: number) => {
    console.log(`Searching at coordinates [${coordinates[0]}, ${coordinates[1]}] with ${radius}km radius`);
  },
  
  logResults: (applications: Application[], method: string, duration: number) => {
    console.log(`Search completed using ${method} method in ${duration}ms. Found ${applications.length} results.`);
  },
  
  logError: (error: unknown) => {
    console.error('Search error:', error);
  }
};
