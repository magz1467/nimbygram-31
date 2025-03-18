import { useEffect } from 'react';

export function DomScanner() {
  useEffect(() => {
    // Function to scan the DOM for map links
    const scanForMapLinks = () => {
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        if (link.href.includes('/map')) {
          console.log('🔍 Found map link in DOM:', link);
          console.log('  - Parent:', link.parentElement);
          console.log('  - Text content:', link.textContent);
          
          // Add a visual indicator
          link.style.border = '2px solid red';
          
          // Override the click handler
          link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔍 Map link clicked:', link.href);
            // You could also add code here to use your state-based approach
          }, true);
        }
      });
      
      // Also check for buttons that might navigate
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.textContent?.includes('Map') || 
            button.innerHTML.includes('Map') ||
            button.classList.contains('map-button')) {
          console.log('🔍 Found potential map button in DOM:', button);
          console.log('  - Parent:', button.parentElement);
          console.log('  - Text content:', button.textContent);
          
          // Add a visual indicator
          button.style.border = '2px solid blue';
        }
      });
    };
    
    // Run the scan initially
    scanForMapLinks();
    
    // Set up a mutation observer to detect new elements
    const observer = new MutationObserver((mutations) => {
      scanForMapLinks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return null;
} 