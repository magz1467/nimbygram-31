
// Mocked search API for development purposes
export const fetchSearch = async (query: string) => {
  console.log('Searching for:', query);
  
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return [
    {
      id: 1,
      title: 'Mock search result 1',
      description: 'This is a mock search result for ' + query,
    },
    {
      id: 2,
      title: 'Mock search result 2',
      description: 'Another mock search result for ' + query,
    }
  ];
};
