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
      switch (filters.classification) {
        case 'high_impact':
          return (app.final_impact_score || 0) > 70;
        case 'entertainment':
          return app.class_3?.toLowerCase() === 'entertainment';
        case 'trees':
          return app.class_3?.toLowerCase() === 'trees';
        case 'demolition':
          return app.class_3?.toLowerCase() === 'demolition';
        case 'housing':
          return app.class_3?.toLowerCase() === 'new_build_houses';
        case 'home_extension':
          return app.class_3?.toLowerCase() === 'home_extension';
        case 'landscaping':
          return app.class_3?.toLowerCase() === 'landscaping';
        case 'other':
          const mainTypes = [
            'entertainment',
            'trees',
            'demolition',
            'new_build_houses',
            'home_extension',
            'landscaping'
          ];
          return !mainTypes.includes(app.class_3?.toLowerCase() || '');
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
        app.title
      ];
      return searchableFields.some(field => 
        field?.toLowerCase().includes(searchLower)
      );
    });
  }

  return filtered;
};