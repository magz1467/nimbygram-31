
import { Application } from "@/types/planning";

/**
 * Filters applications based on status criteria
 */
export const filterByStatus = (applications: Application[], statusFilter?: string): Application[] => {
  if (!statusFilter) return applications;
  
  return applications.filter(app => {
    if (!app.status) {
      return statusFilter === "Other";
    }

    const appStatus = app.status.trim();
    const filterStatus = statusFilter;
    
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
};

/**
 * Filters applications based on classification type
 */
export const filterByClassification = (applications: Application[], classificationFilter?: string): Application[] => {
  if (!classificationFilter) return applications;
  
  return applications.filter(app => {
    // Extract relevant keywords from the title/description to determine category
    const titleLower = (app.description || app.title || '').toLowerCase();
    
    switch (classificationFilter) {
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
};

/**
 * Filters applications based on free text search
 */
export const filterBySearchTerm = (applications: Application[], searchTerm?: string): Application[] => {
  if (!searchTerm) return applications;
  
  const searchLower = searchTerm.toLowerCase();
  return applications.filter(app => {
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
};

/**
 * Applies all filters to the applications
 */
export const applyAllFilters = (
  applications: Application[], 
  filters: { status?: string; type?: string; search?: string; classification?: string; }
): Application[] => {
  if (!applications?.length) return [];
  
  let filtered = [...applications];
  
  // Apply status filter
  if (filters.status) {
    filtered = filterByStatus(filtered, filters.status);
  }
  
  // Apply classification filter
  if (filters.classification) {
    filtered = filterByClassification(filtered, filters.classification);
  }
  
  // Apply search term filter
  if (filters.search) {
    filtered = filterBySearchTerm(filtered, filters.search);
  }
  
  return filtered;
};
