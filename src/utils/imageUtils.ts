
export const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 60 L70 40' stroke='%23999' fill='none' stroke-width='2'/%3E%3Cpath d='M30 50 L50 70 L70 50' stroke='%23999' fill='none' stroke-width='2'/%3E%3C/svg%3E";

export const getImageUrl = (path: string | undefined): string => {
  if (!path || path.trim() === '' || path === 'undefined' || path === 'null') {
    return FALLBACK_IMAGE;
  }
  // Add validation to ensure URL is properly formed
  if (!path.startsWith('/') && !path.startsWith('http')) {
    return FALLBACK_IMAGE;
  }
  return path;
};

// New helper function to get the best available image from an application
export const getBestApplicationImage = (application: any, categoryImages: Record<string, string>): string => {
  // Priority order: streetview_url > image > image_map_url > category image > fallback
  if (application.streetview_url && 
      application.streetview_url !== 'undefined' && 
      application.streetview_url !== 'null') {
    return application.streetview_url;
  }
  
  if (application.image && 
      application.image !== 'undefined' && 
      application.image !== 'null') {
    return application.image;
  }
  
  if (application.image_map_url && 
      application.image_map_url !== 'undefined' && 
      application.image_map_url !== 'null') {
    return application.image_map_url;
  }

  // Then try to determine category from class_3 or title/description
  let detectedCategory = application.class_3 || application.category;
  if (!detectedCategory && application.description) {
    const titleLower = application.description.toLowerCase();
    if (titleLower.includes('demolition')) {
      detectedCategory = 'Demolition';
    } else if (titleLower.includes('extension')) {
      detectedCategory = 'Extension';
    } else if (titleLower.includes('new build')) {
      detectedCategory = 'New Build';
    } else if (titleLower.includes('change of use')) {
      detectedCategory = 'Change of Use';
    } else if (titleLower.includes('listed building')) {
      detectedCategory = 'Listed Building';
    }
  }
  
  // Use category image if available
  if (detectedCategory && categoryImages[detectedCategory]) {
    return categoryImages[detectedCategory];
  }

  // Finally use miscellaneous category image as fallback
  return categoryImages['Miscellaneous'] || FALLBACK_IMAGE;
};
