
/**
 * Processes and validates image URLs from application data
 * @param app Application data object
 * @param defaultImageUrl Default image URL to use as fallback
 * @returns Object containing processed image URLs
 */
export const processImageUrls = (app: any, defaultImageUrl: string) => {
  // Process image URLs - ensure we have valid URLs
  const image = app.image && app.image !== 'undefined' && app.image !== 'null' 
    ? app.image 
    : defaultImageUrl;
  
  const streetviewUrl = app.streetview_url && app.streetview_url !== 'undefined' && app.streetview_url !== 'null'
    ? app.streetview_url
    : null;
    
  const imageMapUrl = app.image_map_url && app.image_map_url !== 'undefined' && app.image_map_url !== 'null'
    ? app.image_map_url
    : null;

  return {
    image,
    streetviewUrl,
    imageMapUrl
  };
};
