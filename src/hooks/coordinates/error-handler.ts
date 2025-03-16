
import { useToast } from '@/hooks/use-toast';

export function handleCoordinateError(error: any, searchTerm: string, toast: ReturnType<typeof useToast>['toast']) {
  console.error("❌ useCoordinates: Error fetching coordinates:", error.message);
        
  // Show user-friendly error toast
  toast({
    title: "Location Error",
    description: error instanceof Error 
      ? error.message
      : `We couldn't find the location "${searchTerm}". Please try a specific UK postcode instead.`,
    variant: "destructive",
  });
}
