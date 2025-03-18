import React from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface Application {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  address: string;
  applicant: string;
  reference: string;
  documents: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
  location: Location;
  imageUrl: string | null;
}

interface ApplicationDetailProps {
  application: Application;
  isLoading?: boolean;
  error?: string | null;
}

export const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  application,
  isLoading = false,
  error = null
}) => {
  if (isLoading) {
    return <div className="loading">Loading application details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const formattedDate = new Date(application.date).toLocaleDateString();
  const statusClass = `status-${application.status.toLowerCase()}`;

  return (
    <div className="application-detail">
      <div className="header">
        <h1>{application.title}</h1>
        <div className="meta">
          <span className={`status ${statusClass}`}>{application.status}</span>
          <span className="date">Submitted: {formattedDate}</span>
          <span className="reference">Ref: {application.reference}</span>
        </div>
      </div>

      <div className="content">
        <div className="main-info">
          <h2>Description</h2>
          <p>{application.description}</p>

          <h2>Location</h2>
          <p className="address">{application.address}</p>

          <h2>Applicant</h2>
          <p>{application.applicant}</p>
        </div>

        <div className="documents">
          <h2>Documents</h2>
          {application.documents.length > 0 ? (
            <ul>
              {application.documents.map(doc => (
                <li key={doc.id}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    {doc.title} ({doc.type})
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No documents available</p>
          )}
        </div>
      </div>

      {application.imageUrl && (
        <div className="image">
          <img src={application.imageUrl} alt={application.title} />
        </div>
      )}
    </div>
  );
}; 