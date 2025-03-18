import React from 'react';
import { Link } from 'react-router-dom';

interface Application {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  address?: string;
  distance?: number;
  imageUrl?: string;
}

interface SearchResultCardProps {
  application: Application;
  onClick?: (application: Application) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ 
  application, 
  onClick 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(application);
    }
  };

  const formattedDate = new Date(application.date).toLocaleDateString();
  const statusClass = `status-${application.status.toLowerCase()}`;

  return (
    <div className="search-result-card" onClick={handleClick}>
      <div className="card-content">
        <h3>{application.title}</h3>
        <div className="meta-info">
          <span className={`status ${statusClass}`}>{application.status}</span>
          <span className="date">{formattedDate}</span>
          {application.distance !== undefined && (
            <span className="distance">{application.distance.toFixed(1)} miles away</span>
          )}
        </div>
        {application.address && <p className="address">{application.address}</p>}
        <p className="description">{application.description}</p>
        <Link to={`/application/${application.id}`} className="view-details">
          View Details
        </Link>
      </div>
      {application.imageUrl && (
        <div className="card-image">
          <img src={application.imageUrl} alt={application.title} />
        </div>
      )}
    </div>
  );
}; 