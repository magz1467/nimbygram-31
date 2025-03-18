
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useMapViewStore } from './store/mapViewStore';
import { Header } from './components/Header';
import { NavigationTracker } from './debug/NavigationTracker';
import { DomScanner } from './debug/DomScanner';

function App() {
  const { isMapView, setMapView } = useMapViewStore();
  const location = useLocation();
  
  // Check if we need to show the map view based on URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('showMap') && params.get('showMap') === 'true') {
      console.log("App detected showMap=true in URL, setting map view to true");
      setMapView(true);
    }
  }, [location.search, setMapView]);
  
  // Listen for our custom mapViewRequested event
  useEffect(() => {
    const handleMapViewRequested = (event: CustomEvent) => {
      console.log("🎯 Map view requested via custom event:", event.detail);
      setMapView(true);
    };
    
    window.addEventListener('mapViewRequested', handleMapViewRequested as EventListener);
    
    return () => {
      window.removeEventListener('mapViewRequested', handleMapViewRequested as EventListener);
    };
  }, [setMapView]);
  
  return (
    <div className="flex flex-col h-screen">
      <NavigationTracker />
      <DomScanner />
      <Header />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
