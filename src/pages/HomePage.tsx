
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to NimbyGram</h1>
      <p className="mb-8">
        Search for planning applications in your area.
      </p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Search for planning applications</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter postcode..." 
            className="px-4 py-2 border rounded flex-1" 
          />
          <Link 
            to="/search-results" 
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
          >
            Search
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Features</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Search planning applications by postcode</li>
            <li>View application details</li>
            <li>See applications on a map</li>
            <li>Toggle between list and map views</li>
          </ul>
        </div>
        <div className="border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <p>
            Enter your postcode to find planning applications in your area.
            You can view detailed information about each application,
            and toggle between list and map views to see their locations.
          </p>
        </div>
      </div>
    </div>
  );
}
