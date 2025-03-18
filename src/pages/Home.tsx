
import React from 'react';
import { SearchBar } from '../components/search/SearchBar';

const Home = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Planning Applications Search</h1>
      <div className="max-w-lg mx-auto">
        <SearchBar />
      </div>
    </div>
  );
};

export default Home;
