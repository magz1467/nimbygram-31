import React from 'react';

interface Application {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  location: {
    address?: string;
  };
}

interface PlanningApplicationListProps {
  applications: Application[];
  onApplicationClick?: (application: Application) => void;
}

const PlanningApplicationList: React.FC<PlanningApplicationListProps> = ({ 
  applications, 
  onApplicationClick 
}) => {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No applications found</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map(application => (
        <div 
          key={application.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          onClick={() => onApplicationClick && onApplicationClick(application)}
        >
          <div className="p-6">
            <div className={`text-xs font-semibold inline-block py-1 px-2 rounded-full mb-2 ${
              application.status === 'Approved' ? 'bg-green-100 text-green-800' :
              application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {application.status}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{application.title}</h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {application.description}
            </p>
            
            <div className="flex justify-between text-sm text-gray-500">
              <div>{application.location.address || 'No address'}</div>
              <div>{new Date(application.date).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanningApplicationList;
