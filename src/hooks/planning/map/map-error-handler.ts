
import { toast } from "@/components/ui/use-toast";

export function handleMapError(error: unknown): string {
  console.error("Map error occurred:", error);
  
  let errorMessage = "An unexpected error occurred.";
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }
  
  // Only show toast for significant errors
  if (!errorMessage.includes('get_nearby_applications') && 
      !errorMessage.includes('Could not find the function')) {
    toast({
      title: "Map Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
  
  return errorMessage;
}

export function displayMapError(error: unknown) {
  const errorMessage = handleMapError(error);
  
  toast({
    title: "Map Error",
    description: errorMessage,
    variant: "destructive",
  });
}
