import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ApplicationDetail } from '@/components/ApplicationDetail';
import { MapView } from '@/components/map/MapView';

interface Document {
  id: string;
  title: string;
  url: string;
  type: string;
}

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
  documents: Document[];
  location: Location;
  imageUrl: string | null;
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate fetching application data
    setLoading(true);
    
    // Mock data for demonstration
    setTimeout(() => {
      if (id) {
        const mockApplication: Application = {
          id,
          title: "Sample Planning Application",
          description: "This is a sample planning application for demonstration purposes.",
          status: "Pending",
          date: "2023-06-15",
          address: "123 Sample Street, Sample City, AB12 3CD",
          applicant: "Sample Applicant",
          reference: `REF-${id}`,
          documents: [
            { id: "doc1", title: "Application Form", url: "#", type: "PDF" },
            { id: "doc2", title: "Site Plan", url: "#", type: "PDF" }
          ],
          location: { lat: 51.505, lng: -0.09 },
          imageUrl: null
        };
        
        setApplication(mockApplication);
        setLoading(false);
      } else {
        setError("Application ID not provided");
        setLoading(false);
      }
    }, 1000);
  }, [id]);

  if (loading) {
    return <div>Loading application details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!application) {
    return <div>Application not found</div>;
  }

  return (
    <div className="application-details-page">
      <Header />
      
      <div className="container">
        <ApplicationDetail 
          application={application}
        />
        
        <div className="map-section">
          <h2>Location</h2>
          <div className="map-container">
            <MapView 
              applications={[application]}
              center={application.location}
              zoom={15}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails; 