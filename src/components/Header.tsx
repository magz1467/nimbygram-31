import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">NimbyGram</Link>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search-results">Search</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
