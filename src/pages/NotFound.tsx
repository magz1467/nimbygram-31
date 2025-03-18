import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-page">
      <Header />
      
      <div className="container">
        <div className="error-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you are looking for doesn't exist or has been moved.</p>
          <Link to="/" className="home-link">Go to Homepage</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 