import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useMapViewStore } from './store/mapViewStore';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { NavigationTracker } from './debug/NavigationTracker';
import { DomScanner } from './debug/DomScanner';

function App() {
  const { isMapView, setMapView } = useMapViewStore();
  const location = useLocation();
  
  // Check if the URL contains /map and set the state accordingly
  useEffect(() => {
    if (location.pathname === '/map') {
      console.log("App detected /map URL, setting map view to true");
      setMapView(true);
    }
  }, [location.pathname, setMapView]);
  
  return (
    <div className="flex flex-col h-screen">
      <NavigationTracker />
      <DomScanner />
      <Header />
      <main className="flex-1 overflow-hidden">
        {isMapView ? <MapView /> : <Outlet />}
      </main>
    </div>
  );
}

export default App;
