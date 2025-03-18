import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define types for our application data
interface Application {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  // Add other properties as needed
}

interface ApplicationContextType {
  applications: Application[];
  loading: boolean;
  error: Error | null;
  getApplicationById: (id: string) => Application | undefined;
  fetchApplications: (query?: string, location?: string, radius?: number) => Promise<void>;
}

// Create the context with a default value
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Sample data for development
const sampleApplications: Application[] = [
  {
    id: '1',
    title: 'New Residential Development',
    description: 'Construction of 24 new residential units with associated parking and landscaping.',
    status: 'Pending',
    date: '2023-06-15',
    location: {
      lat: 51.5074,
      lng: -0.1278,
      address: '123 Main St, London'
    }
  },
  {
    id: '2',
    title: 'Commercial Office Extension',
    description: 'Extension to existing office building to provide additional 500sqm of office space.',
    status: 'Approved',
    date: '2023-05-20',
    location: {
      lat: 51.5174,
      lng: -0.1378,
      address: '456 Business Ave, London'
    }
  },
  {
    id: '3',
    title: 'Change of Use - Retail to Restaurant',
    description: 'Change of use from retail (Class E) to restaurant (Class E) with external alterations.',
    status: 'Under Review',
    date: '2023-07-01',
    location: {
      lat: 51.4974,
      lng: -0.1178,
      address: '789 High Street, London'
    }
  }
];

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch applications
  const fetchApplications = async (query?: string, location?: string, radius?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll use sample data with a delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter applications based on query if provided
      let filteredApplications = [...sampleApplications];
      
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredApplications = filteredApplications.filter(app => 
          app.title.toLowerCase().includes(lowerQuery) || 
          app.description.toLowerCase().includes(lowerQuery)
        );
      }
      
      // In a real app, location and radius would filter based on coordinates
      
      setApplications(filteredApplications);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get application by ID
  const getApplicationById = (id: string): Application | undefined => {
    return applications.find(app => app.id === id);
  };

  // Fetch applications on initial load
  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <ApplicationContext.Provider value={{ 
      applications, 
      loading, 
      error, 
      getApplicationById,
      fetchApplications
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

// Custom hook to use the application context
export const useApplications = (): ApplicationContextType => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
}; 