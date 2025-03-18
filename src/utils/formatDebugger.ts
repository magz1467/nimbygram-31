
const debugFormatting = () => {
  // Check viewport dimensions
  console.log('📱 Viewport:', {
    width: window.innerWidth,
    height: window.innerHeight,
    visualViewport: {
      width: window?.visualViewport?.width,
      height: window?.visualViewport?.height,
      scale: window?.visualViewport?.scale,
    }
  });

  // Check font loading status
  if (document.fonts) {
    console.log('🔤 Fonts loaded:', document.fonts.ready);
    document.fonts.ready.then(() => {
      console.log('🔤 Fonts now loaded:', 
        Array.from(document.fonts)
          .map(font => ({
            family: font.family,
            loaded: font.status === 'loaded'
          }))
      );
    });
  }

  // Check CSS processing
  const listing = document.querySelector('.mobile-application-cards');
  if (listing) {
    const styles = window.getComputedStyle(listing);
    console.log('📏 Listing card styles:', {
      padding: styles.padding,
      margin: styles.margin,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight
    });
  }
};

export const initFormatDebugging = () => {
  debugFormatting();
  
  // Check after fonts load and after resize
  window.addEventListener('resize', debugFormatting);
  if (document.fonts) {
    document.fonts.ready.then(debugFormatting);
  }
  
  // Check after dynamic content updates
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && 
          mutation.target.querySelector('.mobile-application-cards')) {
        console.log('🔄 Content updated, rechecking formatting...');
        debugFormatting();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

