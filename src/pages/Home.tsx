
import React from 'react'
import { Link } from 'react-router-dom'
import { SearchBar } from '@/components/search/SearchBar'
import { Button } from '@/components/ui/button'
import { ArrowRight, Search, MapPin, Building } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">NIMBYgram</h1>
          <nav className="hidden md:flex space-x-6">
            <Link to="/developer-services" className="text-gray-600 hover:text-blue-600">Services</Link>
            <Link to="/map" className="text-gray-600 hover:text-blue-600">Map View</Link>
            <Link to="/applications/dashboard/map" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Welcome to NIMBYgram</h2>
              <p className="text-xl text-gray-600 mb-10">
                Housing Development Tracking Platform - Search for planning applications in your area
              </p>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <SearchBar />
              </div>
              
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/map">
                  <Button variant="outline" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    View Map
                  </Button>
                </Link>
                <Link to="/developer-services">
                  <Button variant="outline" className="gap-2">
                    <Building className="h-4 w-4" />
                    Developer Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4">1</div>
                <h3 className="text-xl font-bold mb-3">Search Your Area</h3>
                <p className="text-gray-600">Enter your postcode or location to see all planning applications in your vicinity.</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4">2</div>
                <h3 className="text-xl font-bold mb-3">Explore Details</h3>
                <p className="text-gray-600">View comprehensive information about each planning application including status and timeline.</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4">3</div>
                <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
                <p className="text-gray-600">Subscribe to notifications for your area to stay informed about new and changing applications.</p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/search-results?search=London&searchType=location&timestamp=1652345678&isLocationName=true">
                <Button className="gap-2">
                  Try a Sample Search
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">NIMBYgram</h3>
              <p className="text-gray-400">Housing Development Tracking Platform</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link to="/developer-services" className="text-gray-400 hover:text-white">Developer Services</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Homeowner Services</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/map" className="text-gray-400 hover:text-white">Map View</Link></li>
                <li><Link to="/applications/dashboard/map" className="text-gray-400 hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} NIMBYgram. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
