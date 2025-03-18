// A simplified version of debugging utilities that won't cause TypeScript errors

export function installNavigationTracer() {
  console.log('🔍 Navigation tracer disabled in production');
}

export function installNavigationOverride() {
  console.log('🔧 Navigation override disabled in production');
}

export function installComponentInspector() {
  console.log('🔍 Component inspector disabled in production');
}

export function installClickTracer() {
  console.log('🖱️ Click tracer disabled in production');
} 