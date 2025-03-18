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
  location: {
    lat: number;
    lng: number;
  };
  imageUrl: string | null;
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError('Application ID is missing');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Mock API call - replace with your actual API
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/applications/${id}`);
        
        // For now, simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockApplication: Application = {
          id: id,
          title: 'Two-story extension to existing property',
          description: 'Proposal to add a two-story extension to the rear of the property, including a new kitchen and bedroom.',
          status: 'Pending',
          date: '2023-05-15',
          address: '123 Example Street, London, SW1A 1AA',
          applicant: 'John Smith',
          reference: 'APP/2023/0123',
          documents: [
            { id: 'doc1', title: 'Application Form', url: '#', type: 'PDF' },
            { id: 'doc2', title: 'Site Plans', url: '#', type: 'PDF' },
            { id: 'doc3', title: 'Elevation Drawings', url: '#', type: 'PDF' }
          ],
          location: {
            lat: 51.505,
            lng: -0.09
          },
          imageUrl: 'https://via.placeholder.com/800x600'
        };
        
        setApplication(mockApplication);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplication();
  }, [id]);

  return (
    <div className="application-details-page">
      <Header />
      
      <div className="container">
        {loading ? (
          <div className="loading">Loading application details...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : application ? (
          <>
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
          </>
        ) : (
          <div className="not-found">Application not found</div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetails; 