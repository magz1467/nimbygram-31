
import { toast } from "@/components/ui/use-toast";
import { handleError } from "@/utils/errors/centralized-handler";

export function handleMapError(error: unknown): string {
  console.error("Map error occurred:", error);
  
  // Use the centralized error handler
  const result = handleError(error, {
    showToast: false,  // We'll handle toast display manually
    logToConsole: true
  });
  
  // Only show toast for significant errors
  if (!result.message.includes('get_nearby_applications') && 
      !result.message.includes('Could not find the function')) {
    toast({
      title: "Map Error",
      description: result.message,
      variant: "destructive",
    });
  }
  
  return result.message;
}

export function displayMapError(error: unknown) {
  const errorMessage = handleMapError(error);
  
  toast({
    title: "Map Error",
    description: errorMessage,
    variant: "destructive",
  });
}
