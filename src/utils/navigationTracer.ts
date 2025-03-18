/**
 * This utility creates a stack trace when navigation to map is attempted
 * to help identify the source of the navigation
 */

export function installNavigationTracer(): boolean {
  console.log('🔍 Navigation tracer safely disabled');
  return true;
} 