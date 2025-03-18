/**
 * This utility overrides browser navigation functions to help debug
 * and intercept navigation to the /map URL
 */

export function installNavigationOverride(): boolean {
  console.log('🔧 Navigation override safely disabled');
  return true;
} 