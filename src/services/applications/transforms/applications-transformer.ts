
import { Application } from "@/types/planning";
import { transformApplicationData } from "@/utils/transforms/application-transformer";
import { calculateDistance, sortApplicationsByDistance } from "@/utils/distance";

export const transformAndSortApplications = (
  applications: any[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || !Array.isArray(applications) || applications.length === 0) {
    return [];
  }
  
  console.log(`Transforming and sorting ${applications.length} applications`);
  
  // Transform the applications
  const transformedApplications = applications
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null);
  
  // Use our canonical sorting by distance function
  const sortedApps = sortApplicationsByDistance(transformedApplications, coordinates);
  
  // Check if the sorting worked as expected
  if (sortedApps.length > 0) {
    console.log("\n🔍 First 5 applications sorted by distance (from transformer):");
    sortedApps.slice(0, 5).forEach((app, index) => {
      const distVal = (app as any).distanceValue;
      console.log(`${index + 1}. ID: ${app.id}, Address: ${app.address}, Distance: ${typeof distVal === 'number' ? distVal.toFixed(3) : 'unknown'}km (${app.distance})`);
    });
  }
  
  return sortedApps;
};
