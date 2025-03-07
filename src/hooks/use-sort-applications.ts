
import { Application } from '@/types/planning';
import { SortType } from '@/types/application-types';

export const useSortApplications = (applications: Application[], sortType: SortType) => {
  if (!applications) return [];
  
  switch (sortType) {
    case 'newest':
      return [...applications].sort((a, b) => {
        const dateA = a.valid_date ? new Date(a.valid_date).getTime() : 0;
        const dateB = b.valid_date ? new Date(b.valid_date).getTime() : 0;
        return dateB - dateA; // newest first
      });
      
    case 'impact':
      return [...applications].sort((a, b) => {
        const impactA = a.final_impact_score ?? 0;
        const impactB = b.final_impact_score ?? 0;
        return impactB - impactA; // highest impact first
      });
      
    case 'distance':
      return [...applications].sort((a, b) => {
        if (!a.distance && !b.distance) return 0;
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        
        const distanceA = parseFloat(a.distance.split(' ')[0]);
        const distanceB = parseFloat(b.distance.split(' ')[0]);
        
        return distanceA - distanceB; // closest first
      });
      
    default:
      return applications;
  }
};
