
import { Application } from "@/types/planning";

interface FilterConfig {
  status?: string;
  type?: string;
  search?: string;
  classification?: string;
}

export const useApplicationFiltering = (applications: Application[], filters: FilterConfig) => {
  if (!applications?.length) return [];
  let filtered = [...applications];

  if (filters.status) {
    filtered = filtered.filter(app => {
      if (!app.status) {
        return filters.status === "Other";
      }

      const appStatus = app.status.trim();
      const filterStatus = filters.status;
      
      if (filterStatus === "Under Review") {
        return appStatus.toLowerCase().includes('under consideration');
      }
      
      if (filterStatus === "Other") {
        const predefinedStatuses = ["Under Review", "Approved", "Declined"];
        const predefinedMatches = predefinedStatuses.some(status => {
          if (status === "Under Review") {
            return appStatus.toLowerCase().includes('under consideration');
          }
          return appStatus.toLowerCase().includes(status.toLowerCase());
        });
        return !predefinedMatches;
      }
      
      return appStatus.toLowerCase().includes(filterStatus.toLowerCase());
    });
  }

  if (filters.classification) {
    filtered = filtered.filter(app => {
      // Extract relevant keywords from the title/description to determine category
      const titleLower = (app.description || app.title || '').toLowerCase();
      
      switch (filters.classification) {
        case 'residential':
          return titleLower.includes('residential') || 
                 titleLower.includes('dwelling') || 
                 titleLower.includes('house') || 
                 titleLower.includes('flat');
        case 'commercial':
          return titleLower.includes('commercial') || 
                 titleLower.includes('shop') || 
                 titleLower.includes('retail') || 
                 titleLower.includes('office');
        case 'industrial':
          return titleLower.includes('industrial') || 
                 titleLower.includes('warehouse') || 
                 titleLower.includes('factory');
        case 'mixed_use':
          return titleLower.includes('mixed use');
        case 'green_space':
          return titleLower.includes('garden') || 
                 titleLower.includes('park') || 
                 titleLower.includes('landscape');
        case 'religious':
          return titleLower.includes('church') || 
                 titleLower.includes('mosque') || 
                 titleLower.includes('temple') ||
                 titleLower.includes('religious');
        case 'storage':
          return titleLower.includes('storage') || 
                 titleLower.includes('garage');
        case 'other':
          // If no other category matches, consider it as "other"
          return true;
        default:
          return true;
      }
    });
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(app => {
      const searchableFields = [
        app.description,
        app.address,
        app.reference,
        app.title,
        app.category
      ];
      return searchableFields.some(field => 
        field?.toLowerCase().includes(searchLower)
      );
    });
  }

  // Debug logging to see filtered results
  console.log('Filtered applications:', filtered.length);
  return filtered;
};
