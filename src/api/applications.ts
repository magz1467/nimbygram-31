
// Mocked application API for development purposes
export const fetchApplications = async (postcode: string) => {
  console.log('Fetching applications for postcode:', postcode);
  
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return [
    {
      id: 1,
      reference: 'APP/2023/0001',
      address: '123 Main Street, ' + postcode,
      description: 'Change of use from residential to commercial',
      status: 'Under Review',
      date: '2023-05-15',
      location: { lat: 51.5074, lng: -0.1278 },
      distance: 0.5,
    },
    {
      id: 2,
      reference: 'APP/2023/0002',
      address: '456 High Street, ' + postcode,
      description: 'Construction of a three-story residential building',
      status: 'Approved',
      date: '2023-06-20',
      location: { lat: 51.5114, lng: -0.1298 },
      distance: 1.2,
    }
  ];
};
