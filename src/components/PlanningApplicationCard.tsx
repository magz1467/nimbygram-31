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
  applicant?: string;
  reference?: string;
  location?: Location;
  imageUrl?: string;
}

interface PlanningApplicationCardProps {
  application: PlanningApplication;
  onClick?: (application: PlanningApplication) => void;
}

export const PlanningApplicationCard: React.FC<PlanningApplicationCardProps> = ({
  application,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(application);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // Get status color based on application status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'refused':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
            {application.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-2">
          {application.reference} • {formatDate(application.date)}
        </p>
        
        <p className="text-gray-700 mb-3">{application.address}</p>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{application.description}</p>
        
        <Link 
          to={`/application/${application.id}`} 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details →
        </Link>
      </div>
      
      {application.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={application.imageUrl} 
            alt={application.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.src = "https://via.placeholder.com/400x200?text=No+Image";
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PlanningApplicationCard; 