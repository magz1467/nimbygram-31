/**
 * This utility overrides browser navigation functions to help debug
 * and intercept navigation to the /map URL
 */

export function installNavigationOverride() {
  console.log('🔧 Installing navigation override');
  
  try {
    // Create a navigation utility object that logs navigation actions
    // without trying to override native browser properties
    window.navigationUtils = {
      // Safe navigation methods
      navigate: (url: string) => {
        console.log('🔄 Navigation utility: navigating to', url);
        window.location.href = url;
      },
      
      assign: (url: string) => {
        console.log('🔄 Navigation utility: assigning to', url);
        window.location.assign(url);
      },
      
      replace: (url: string) => {
        console.log('🔄 Navigation utility: replacing with', url);
        window.location.replace(url);
      },
      
      // History API wrappers
      pushState: (state: any, title: string, url?: string) => {
        console.log('🔄 Navigation utility: history.pushState to', url);
        window.history.pushState(state, title, url);
      },
      
      replaceState: (state: any, title: string, url?: string) => {
        console.log('🔄 Navigation utility: history.replaceState to', url);
        window.history.replaceState(state, title, url);
      }
    };
    
    // Monitor navigation events without modifying native objects
    window.addEventListener('popstate', (event) => {
      console.log('🔄 Navigation detected: popstate', {
        state: event.state,
        url: window.location.href
      });
    });
    
    // Monitor clicks that might lead to navigation
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          console.log('🔄 Potential navigation: clicked link to', href);
        }
      }
    }, true);
    
    console.log('✅ Navigation override installed safely');
  } catch (error) {
    console.error('❌ Failed to install navigation override:', error);
  }
} 