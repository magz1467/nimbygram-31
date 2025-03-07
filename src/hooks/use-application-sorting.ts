
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";

interface SortConfig {
  type: SortType;
  applications: Application[];
}

const sortByNewest = (applications: Application[]) => {
  return [...applications].sort((a, b) => {
    const dateA = a.valid_date ? new Date(a.valid_date) : null;
    const dateB = b.valid_date ? new Date(b.valid_date) : null;

    // Invalid dates go to the end
    if (!dateA || isNaN(dateA.getTime())) return 1;
    if (!dateB || isNaN(dateB.getTime())) return -1;

    // Sort by date descending (newest first)
    return dateB.getTime() - dateA.getTime();
  });
};

const sortByImpactScore = (applications: Application[]) => {
  return [...applications].sort((a, b) => {
    // Handle null values - push them to the bottom
    if (a.final_impact_score === null && b.final_impact_score === null) return 0;
    if (a.final_impact_score === null) return 1;
    if (b.final_impact_score === null) return -1;
    
    // Convert to numbers and sort by impact score descending (highest first)
    const scoreA = Number(a.final_impact_score);
    const scoreB = Number(b.final_impact_score);
    
    return scoreB - scoreA;
  });
};

const sortByDistance = (applications: Application[]) => {
  return [...applications].sort((a, b) => {
    // If either application doesn't have a distance, put it at the end
    if (!a.distance && !b.distance) return 0;
    if (!a.distance) return 1;
    if (!b.distance) return -1;
    
    // Extract numerical distance value for comparison
    const distanceA = parseFloat(a.distance.split(' ')[0]) || 0;
    const distanceB = parseFloat(b.distance.split(' ')[0]) || 0;
    
    // Sort by ascending distance (closest first)
    return distanceA - distanceB;
  });
};

export const useApplicationSorting = ({ type, applications }: SortConfig) => {
  if (!applications?.length) return [];
  
  console.log('Sorting applications with type:', type);
  console.log('Number of applications before sort:', applications.length);

  let sorted;
  switch (type) {
    case 'newest':
      sorted = sortByNewest(applications);
      break;
    case 'impact':
      sorted = sortByImpactScore(applications);
      break;
    case 'distance':
      sorted = sortByDistance(applications);
      break;
    default:
      sorted = applications;
  }

  console.log('Number of applications after sort:', sorted.length);
  return sorted;
};
