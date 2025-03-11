
export const FALLBACK_IMAGE = "/placeholder.svg";

export const getImageUrl = (path: string | undefined | null): string => {
  // Check for invalid inputs
  if (!path || path === 'undefined' || path === 'null' || path.trim() === '') {
    return FALLBACK_IMAGE;
  }
  
  // Check for valid URL format
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  
  // Return fallback for invalid URLs
  console.log(`Invalid image path format: ${path}, using fallback`);
  return FALLBACK_IMAGE;
};
