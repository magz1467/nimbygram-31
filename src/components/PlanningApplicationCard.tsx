import React from 'react';
import { Link } from 'react-router-dom';

interface Location {
  lat: number;
  lng: number;
}

interface PlanningApplication {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  address: string;
  location: Location;
  distance?: number;
  imageUrl?: string;
}

interface PlanningApplicationCardProps {
  application: PlanningApplication;
  onClick?: () => void;
}

export const PlanningApplicationCard: React.FC<PlanningApplicationCardProps> = ({
  application,
  onClick
}) => {
  // Format date for display
  const formattedDate = new Date(application.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Determine status class for styling
  const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'rejected') return 'status-rejected';
    return 'status-pending';
  };

  const statusClass = getStatusClass(application.status);

  return (
    <div className="planning-application-card" onClick={onClick}>
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