
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { useMapViewStore } from './store/mapViewStore';
import { MapView } from './components/MapView';
import './App.css';

function App() {
  const { isMapView } = useMapViewStore();
  const location = useLocation();
  
  return (
    <div className="app">
      <Header />
      <main>
        {isMapView ? <MapView /> : <Outlet />}
      </main>
    </div>
  );
}

export default App;
