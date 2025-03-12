
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import { Toaster } from '@/components/ui/toaster';

// Create a client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
      retry: 2, // Retry failed queries twice
      refetchOnWindowFocus: false // Don't refetch when window regains focus
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
