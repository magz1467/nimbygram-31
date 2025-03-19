
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Index from './pages/Index'
import DeveloperServices from './pages/DeveloperServices'
import SearchResultsPage from './pages/SearchResults'
import MapViewPage from './pages/MapView'
import ApplicationsDashboardMapPage from './pages/applications/dashboard/map'
import Auth from './pages/Auth'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
        <Route path="/developer-services" element={<DeveloperServices />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
        <Route path="/map" element={<MapViewPage />} />
        <Route path="/applications/dashboard/map" element={<ApplicationsDashboardMapPage />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  )
}

export default App
