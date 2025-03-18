/**
 * This utility traces all click events to help identify map-related navigation
 */

export function installClickTracer() {
  console.log('🖱️ Installing click tracer');
  
  // Store original window.open
  const originalWindowOpen = window.open;
  window.open = function(...args) {
    const url = args[0];
    if (url && typeof url === 'string' && url.includes('map')) {
      console.log('🚨 window.open with map URL detected:', url);
      console.trace('window.open stack trace');
    }
    return originalWindowOpen.apply(this, args);
  };
  
  // Add global click listener
  document.addEventListener('click', (event) => {
    // Get the clicked element
    const target = event.target as HTMLElement;
    
    // Check if this is a link or button
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
        target.closest('a') || target.closest('button') ||
        target.getAttribute('role') === 'button') {
      
      // Get the actual element (might be a child of a button/link)
      const element = target.tagName === 'A' || target.tagName === 'BUTTON' ? 
                      target : 
                      (target.closest('a') || target.closest('button') || target);
      
      // Check if it has map-related attributes or content
      const outerHTML = element.outerHTML;
      const innerText = element.innerText || '';
      const href = element.getAttribute('href') || '';
      
      if (outerHTML.includes('map') || 
          innerText.toLowerCase().includes('map') || 
          href.includes('map')) {
        console.log('🖱️ Clicked on map-related element:', {
          element,
          outerHTML,
          innerText,
          href
        });
        
        // Log the stack trace
        console.trace('Click stack trace');
      }
    }
  }, true);
  
  console.log('✅ Click tracer installed');
} 