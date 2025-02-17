
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
      const category = app.category?.toLowerCase() || 'other';
      const classification = filters.classification.toLowerCase();

      switch (classification) {
        case 'residential':
          return category === 'residential';
        case 'commercial':
          return category === 'commercial';
        case 'industrial':
          return category === 'industrial';
        case 'mixed_use':
          return category === 'mixed use';
        case 'green_space':
          return category === 'green space';
        case 'religious':
          return category === 'religious';
        case 'storage':
          return category === 'storage';
        case 'other':
          const mainTypes = [
            'residential',
            'commercial',
            'industrial',
            'mixed use',
            'green space',
            'religious',
            'storage'
          ];
          return !mainTypes.includes(category);
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

  return filtered;
};
