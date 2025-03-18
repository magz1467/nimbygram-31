import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApplications } from '../context/ApplicationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ApplicationMap from '../components/ApplicationMap';

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getApplicationById, loading } = useApplications();
  const [application, setApplication] = useState(id ? getApplicationById(id) : undefined);

  useEffect(() => {
    if (id) {
      setApplication(getApplicationById(id));
    }
  }, [id, getApplicationById]);

  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // Get status color based on application status
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
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

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 flex justify-center">
        <LoadingSpinner size="large" text="Loading application details..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Application Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">The application you are looking for doesn't exist or has been removed.</p>
        <Link to="/search" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200">
          Search Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6">
        <Link to="/search" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Search Results
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0 md:mr-4">{application.title}</h1>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Application Details</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <span className="text-gray-600">Reference:</span>
                    <span className="col-span-2 font-medium">{application.reference}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <span className="text-gray-600">Date:</span>
                    <span className="col-span-2">{formatDate(application.date)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <span className="text-gray-600">Applicant:</span>
                    <span className="col-span-2">{application.applicant}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-600">Address:</span>
                    <span className="col-span-2">{application.address}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700">{application.description}</p>
              </div>
              
              {application.documents && application.documents.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Documents</h2>
                  <ul className="bg-gray-50 p-4 rounded-md divide-y divide-gray-200">
                    {application.documents.map(doc => (
                      <li key={doc.id} className="py-2 first:pt-0 last:pb-0">
                        <a 
                          href={doc.url} 
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          {doc.title} ({doc.type})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              {application.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={application.imageUrl} 
                    alt={application.title} 
                    className="w-full h-auto rounded-md shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/600x400?text=No+Image";
                    }}
                  />
                </div>
              )}
              
              {application.location && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Location</h2>
                  <ApplicationMap 
                    applications={[application]} 
                    center={application.location}
                    zoom={15}
                    height="300px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails; 