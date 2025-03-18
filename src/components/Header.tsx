import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">Your App Name</Link>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search-results">Search</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
