
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
        const presome(status => {
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
      
      // Use the category field that we set during data transformation
      const category = app.category.toLowerCase();
      const classification = filters.classification.toLowerCase();
      
      return category === classification;
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
