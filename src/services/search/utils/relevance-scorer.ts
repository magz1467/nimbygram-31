
import { Application } from "@/types/planning";

export const calculateRelevance = (application: Application, searchTerm: string): number => {
  let score = 0;
  const searchTermLower = searchTerm.toLowerCase();
  
  // Exact location matches get highest priority
  if (application.ward?.toLowerCase() === searchTermLower) {
    score += 300;
  } else if (application.ward?.toLowerCase().includes(searchTermLower)) {
    score += 200;
  }
  
  // Check for district matches
  const district = application.local_authority_district_name || '';
  if (district.toLowerCase() === searchTermLower) {
    score += 250;
  } else if (district.toLowerCase().includes(searchTermLower)) {
    score += 150;
  }
  
  // Address matches
  if (application.address?.toLowerCase().includes(searchTermLower)) {
    score += 100;
    if (application.address.toLowerCase().startsWith(searchTermLower)) {
      score += 50;
    }
  }
  
  // Description matches
  if (application.description?.toLowerCase().includes(searchTermLower)) {
    score += 30;
  }
  
  console.log(`🔢 Relevance score for app ${application.id}: ${score} (${application.ward || 'no ward'}, ${district || 'no district'})`);
  return score;
};
