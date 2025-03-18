import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types
interface Location {
  lat: number;
  lng: number;
}

export interface PlanningApplication {
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
  documents?: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
}

interface ApplicationContextType {
  applications: PlanningApplication[];
  loading: boolean;
  error: string | null;
  fetchApplications: (query?: string, location?: string, radius?: number) => Promise<void>;
  getApplicationById: (id: string) => PlanningApplication | undefined;
}

// Create context
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Sample data
const sampleApplications: PlanningApplication[] = [
  {
    id: '1',
    title: 'Two-story extension to existing dwelling',
    description: 'Proposed two-story side extension to create additional bedroom and enlarged kitchen area.',
    status: 'Pending',
    date: '2023-05-15',
    address: '123 High Street, Anytown, AN1 2BC',
    applicant: 'John Smith',
    reference: 'APP/2023/0123',
    location: { lat: 51.505, lng: -0.09 },
    imageUrl: 'https://via.placeholder.com/400x300?text=House+Extension',
    documents: [
      { id: 'd1', title: 'Application Form', url: '#', type: 'PDF' },
      { id: 'd2', title: 'Site Plan', url: '#', type: 'PDF' },
      { id: 'd3', title: 'Elevation Drawings', url: '#', type: 'PDF' }
    ]
  },
  {
    id: '2',
    title: 'Change of use from retail to restaurant',
    description: 'Application for change of use from Class E(a) retail to Class E(b) restaurant with outdoor seating area.',
    status: 'Approved',
    date: '2023-04-22',
    address: '45 Market Square, Anytown, AN1 3DF',
    applicant: 'Sarah Johnson',
    reference: 'APP/2023/0089',
    location: { lat: 51.507, lng: -0.095 },
    imageUrl: 'https://via.placeholder.com/400x300?text=Restaurant',
    documents: [
      { id: 'd4', title: 'Application Form', url: '#', type: 'PDF' },
      { id: 'd5', title: 'Floor Plans', url: '#', type: 'PDF' },
      { id: 'd6', title: 'Noise Assessment', url: '#', type: 'PDF' }
    ]
  },
  {
    id: '3',
    title: 'New residential development',
    description: 'Construction of 12 new residential units with associated parking and landscaping.',
    status: 'In Progress',
    date: '2023-06-01',
    address: 'Land at West Road, Anytown, AN2 4GH',
    applicant: 'Anytown Developments Ltd',
    reference: 'APP/2023/0156',
    location: { lat: 51.51, lng: -0.1 },
    imageUrl: 'https://via.placeholder.com/400x300?text=Housing+Development',
    documents: [
      { id: 'd7', title: 'Application Form', url: '#', type: 'PDF' },
      { id: 'd8', title: 'Site Layout', url: '#', type: 'PDF' },
      { id: 'd9', title: 'Design & Access Statement', url: '#', type: 'PDF' },
      { id: 'd10', title: 'Environmental Impact Assessment', url: '#', type: 'PDF' }
    ]
  }
];

// Provider component
export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<PlanningApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    setApplications(sampleApplications);
  }, []);

  // Fetch applications based on search criteria
  const fetchApplications = async (query?: string, location?: string, radius?: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter applications based on search criteria
      let filteredApplications = [...sampleApplications];
      
      if (query) {
        const queryLower = query.toLowerCase();
        filteredApplications = filteredApplications.filter(app => 
          app.title.toLowerCase().includes(queryLower) || 
          app.description.toLowerCase().includes(queryLower)
        );
      }
      
      // In a real app, you would use location and radius for filtering
      
      setApplications(filteredApplications);
    } catch (err) {
      setError('Failed to fetch applications. Please try again.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get application by ID
  const getApplicationById = (id: string): PlanningApplication | undefined => {
    return applications.find(app => app.id === id);
  };

  return (
    <ApplicationContext.Provider value={{
      applications,
      loading,
      error,
      fetchApplications,
      getApplicationById
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

// Custom hook for using the context
export const useApplications = (): ApplicationContextType => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
}; 