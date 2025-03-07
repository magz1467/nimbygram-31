export const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 60 L70 40' stroke='%23999' fill='none' stroke-width='2'/%3E%3Cpath d='M30 50 L50 70 L70 50' stroke='%23999' fill='none' stroke-width='2'/%3E%3C/svg%3E";

export const getImageUrl = (path: string | undefined): string => {
  if (!path || path.trim() === '' || path === 'undefined' || path === 'null') {
    return FALLBACK_IMAGE;
  }
  if (!path.startsWith('/') && !path.startsWith('http')) {
    return FALLBACK_IMAGE;
  }
  return path;
};