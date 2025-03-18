import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">NimbyGram</Link>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
