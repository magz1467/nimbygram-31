
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
      
      // Extract relevant keywords from the title/description to determine category
      const titleLower = (app.title || app.description || '').toLowerCase();
      const isExtension = titleLower.includes('extension') || titleLower.includes('extend');
      const isChangeOfUse = titleLower.includes('change of use') || titleLower.includes('conversion');
      const isResidential = titleLower.includes('residential') || titleLower.includes('dwelling') || titleLower.includes('house') || titleLower.includes('flat');
      const isCommercial = titleLower.includes('commercial') || titleLower.includes('shop') || titleLower.includes('retail') || titleLower.includes('office');
      const isIndustrial = titleLower.includes('industrial') || titleLower.includes('warehouse') || titleLower.includes('factory');
      const isMixedUse = titleLower.includes('mixed use') || (isResidential && isCommercial);
      const isGreenSpace = titleLower.includes('garden') || titleLower.includes('park') || titleLower.includes('landscape');
      const isReligious = titleLower.includes('church') || titleLower.includes('mosque') || titleLower.includes('temple');
      const isStorage = titleLower.includes('storage') || titleLower.includes('garage');

      // Match the filter value with the detected category
      switch (filters.classification) {
        case 'residential':
          return isResidential;
        case 'commercial':
          return isCommercial;
        case 'industrial':
          return isIndustrial;
        case 'mixed_use':
          return isMixedUse;
        case 'green_space':
          return isGreenSpace;
        case 'religious':
          return isReligious;
        case 'storage':
          return isStorage;
        case 'other':
          // If it doesn't match any other category, it's "other"
          return !isResidential && !isCommercial && !isIndustrial && 
                 !isMixedUse && !isGreenSpace && !isReligious && !isStorage;
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
