// This script disables the problematic override functions
(function() {
  console.log('🛑 Disabling problematic override functions');
  
  // Replace problematic functions with empty implementations
  window.installNavigationOverride = function() {
    console.log('⚠️ Navigation override disabled');
    return true;
  };
  
  window.installComponentInspector = function() {
    console.log('⚠️ Component inspector disabled');
    return true;
  };
  
  window.installClickTracer = function() {
    console.log('⚠️ Click tracer disabled');
    return true;
  };
  
  // Also prevent any attempts to modify window.location methods
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // Block attempts to redefine location properties
    if (obj === window.location && 
        (prop === 'assign' || prop === 'replace' || prop === 'reload' || prop === 'href')) {
      console.log(`⚠️ Blocked attempt to redefine window.location.${prop}`);
      return obj;
    }
    return originalDefineProperty.apply(this, arguments);
  };
  
  console.log('✅ Override functions successfully disabled');
})(); 