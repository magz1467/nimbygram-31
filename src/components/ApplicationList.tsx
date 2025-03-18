import React from 'react';

// If you're using TypeScript with React 17+, you can also use this import style:
// import * as React from 'react';

interface Application {
  id: string;
  name: string;
  status: string;
  // Add other properties as needed
}

interface ApplicationListProps {
  applications: Application[];
  onSelect?: (application: Application) => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ applications, onSelect }) => {
  return (
    <div className="application-list">
      <h2>Applications</h2>
      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <ul>
          {applications.map((app) => (
            <li key={app.id} onClick={() => onSelect && onSelect(app)}>
              <div className="application-item">
                <h3>{app.name}</h3>
                <span className={`status status-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApplicationList; 