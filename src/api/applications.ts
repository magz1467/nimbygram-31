
import { Application } from '@/types/planning';
import { transformApplicationData } from '@/utils/transforms/application-transformer';

// Mock data for development
const mockApplications: Application[] = [
  {
    id: 1,
    title: 'New Housing Development',
    address: '123 Main Street, London',
    status: 'Under Review',
    coordinates: [51.5074, -0.1278],
    reference: 'APP/2023/0001',
    description: 'Proposal for 20 new residential units with parking',
    submittedDate: '2023-06-15',
    consultationEnd: '2023-07-15',
    type: 'Residential',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    id: 2,
    title: 'Commercial Office Extension',
    address: '45 Business Park, Manchester',
    status: 'Approved',
    coordinates: [53.4808, -2.2426],
    reference: 'APP/2023/0002',
    description: 'Extension to existing office building',
    submittedDate: '2023-05-20',
    consultationEnd: '2023-06-20',
    type: 'Commercial',
    latitude: 53.4808,
    longitude: -2.2426,
  },
  {
    id: 3,
    title: 'Community Center Renovation',
    address: '78 Park Avenue, Birmingham',
    status: 'Declined',
    coordinates: [52.4862, -1.8904],
    reference: 'APP/2023/0003',
    description: 'Renovation and modernization of community center',
    submittedDate: '2023-04-10',
    consultationEnd: '2023-05-10',
    type: 'Community',
    latitude: 52.4862,
    longitude: -1.8904,
  }
];

/**
 * Fetch all applications
 */
export const fetchApplications = async (postcode?: string | null): Promise<Application[]> => {
  // In a real app, this would call an API with the postcode
  console.log(`Fetching applications for postcode: ${postcode}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockApplications;
};

/**
 * Fetch a single application by ID
 */
export const fetchApplicationById = async (id: number): Promise<Application | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const application = mockApplications.find(app => app.id === id);
  
  if (!application) {
    return null;
  }
  
  return application;
};
