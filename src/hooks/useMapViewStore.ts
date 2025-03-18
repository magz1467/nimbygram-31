import { create } from 'zustand';

interface MapViewState {
  isMapView: boolean;
  setMapView: (isMapView: boolean) => void;
}

export const useMapViewStore = create<MapViewState>((set) => ({
  isMapView: false,
  setMapView: (isMapView) => {
    console.log('setMapView called with:', isMapView);
    set({ isMapView });
  },
}));

// Add this to your main index.tsx or App.tsx file
if (typeof window !== 'undefined') {
  // Debug helper to find navigation events
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[href="/map"]') || target.closest('button')) {
      console.log('Potential map navigation element clicked:', target);
      console.log('Element path:', getElementPath(target));
    }
  }, true);
}

// Helper function to get the path to an element
function getElementPath(element: HTMLElement): string {
  const path = [];
  let current = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.className) {
      selector += `.${current.className.split(' ').join('.')}`;
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
} 