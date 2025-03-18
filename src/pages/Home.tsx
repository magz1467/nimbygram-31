import React from 'react'

const Home: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome to NimbyGram</h1>
      <p className="mb-6">This is a platform for exploring and understanding planning applications in your area.</p>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-2xl font-semibold mb-3">Features</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>View planning applications on a map</li>
          <li>Search for applications by location</li>
          <li>Get notifications about new applications</li>
          <li>Understand the planning process</li>
        </ul>
      </div>
    </div>
  )
}

export default Home
