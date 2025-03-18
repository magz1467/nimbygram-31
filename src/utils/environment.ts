
export function getEnvironmentName(): string {
  if (typeof window === 'undefined') return 'server';
  
  const hostname = window.location.hostname;
  if (hostname.includes('localhost')) return 'local';
  if (hostname.includes('staging')) return 'staging';
  return 'production';
}

export function getCurrentHostname(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
}
