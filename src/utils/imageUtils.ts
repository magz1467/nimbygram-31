
export const FALLBACK_IMAGE = "/placeholder.svg";

export const getImageUrl = (path: string | undefined | null): string => {
  // Check for invalid inputs
  if (!path || path === 'undefined' || path === 'null' || path.trim() === '') {
    console.log(`Invalid image path: ${path}, using fallback`);
    return FALLBACK_IMAGE;
  }
  
  // Check for valid URL format
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    // Validate that the URL isn't just a protocol with nothing after
    if (path === 'http://' || path === 'https://' || path === '/') {
      console.log(`Invalid image URL format: ${path}, using fallback`);
      return FALLBACK_IMAGE;
    }
    return path;
  }
  
  // Try to infer a URL format
  if (path.includes('.jpg') || path.includes('.png') || path.includes('.jpeg') || path.includes('.svg') || path.includes('.webp')) {
    // If it looks like an image file but doesn't have http://, add it
    if (!path.startsWith('http')) {
      return `https://${path}`;
    }
    return path;
  }
  
  // Return fallback for invalid URLs
  console.log(`Invalid image path format: ${path}, using fallback`);
  return FALLBACK_IMAGE;
};
