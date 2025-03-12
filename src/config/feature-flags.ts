
/**
 * Feature flags system for toggling features
 */

// Define feature flags
export const FeatureFlags = {
  USE_SPATIAL_SEARCH: 'use-spatial-search',
  USE_SEARCH_CACHE: 'use-search-cache',
  ENABLE_PROGRESSIVE_LOADING: 'enable-progressive-loading',
  ENABLE_RETRY_LOGIC: 'enable-retry-logic',
  SHOW_DETAILED_ERRORS: 'show-detailed-errors'
};

type FeatureFlagStore = {
  [key: string]: boolean;
};

// Default flag values
const DEFAULT_FLAGS: FeatureFlagStore = {
  [FeatureFlags.USE_SPATIAL_SEARCH]: true,
  [FeatureFlags.USE_SEARCH_CACHE]: true,
  [FeatureFlags.ENABLE_PROGRESSIVE_LOADING]: true,
  [FeatureFlags.ENABLE_RETRY_LOGIC]: true,
  [FeatureFlags.SHOW_DETAILED_ERRORS]: false
};

class FeatureFlagService {
  private flags: FeatureFlagStore;
  
  constructor(initialFlags: FeatureFlagStore = DEFAULT_FLAGS) {
    // Load flags from localStorage if available
    try {
      const savedFlags = localStorage.getItem('feature_flags');
      this.flags = savedFlags ? { ...initialFlags, ...JSON.parse(savedFlags) } : initialFlags;
    } catch (e) {
      console.error('Error loading feature flags from localStorage:', e);
      this.flags = initialFlags;
    }
  }
  
  isEnabled(flag: string): boolean {
    return !!this.flags[flag];
  }
  
  enable(flag: string): void {
    this.flags[flag] = true;
    this.saveFlags();
  }
  
  disable(flag: string): void {
    this.flags[flag] = false;
    this.saveFlags();
  }
  
  toggle(flag: string): boolean {
    this.flags[flag] = !this.flags[flag];
    this.saveFlags();
    return this.flags[flag];
  }
  
  private saveFlags(): void {
    try {
      localStorage.setItem('feature_flags', JSON.stringify(this.flags));
    } catch (e) {
      console.error('Error saving feature flags to localStorage:', e);
    }
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagService();
