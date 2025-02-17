
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
      // Debug logging to see what categories are coming in
      console.log('Filtering app with category:', app.category, 'against classification:', filters.classification);
      
      if (!app.category) return filters.classification === 'other';
      
      // Match the filter value with the actual category values in the database
      switch (filters.classification) {
        case 'residential':
          return app.category.toLowerCase() === 'residential';
        case 'commercial':
          return app.category.toLowerCase() === 'commercial';
        case 'industrial':
          return app.category.toLowerCase() === 'industrial';
        case 'mixed_use':
          return app.category.toLowerCase() === 'mixed use';
        case 'green_space':
          return app.category.toLowerCase() === 'green space';
        case 'religious':
          return app.category.toLowerCase() === 'religious';
        case 'storage':
          return app.category.toLowerCase() === 'storage';
        case 'other':
          const mainCategories = [
            'residential',
            'commercial',
            'industrial',
            'mixed use',
            'green space',
            'religious',
            'storage'
          ];
          return !mainCategories.includes(app.category.toLowerCase());
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
