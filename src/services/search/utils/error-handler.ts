
import { toast } from "@/hooks/use-toast";
import { SearchError } from "../types/search-types";

export class SearchTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchTimeoutError';
  }
}

export const handleSearchError = (error: any) => {
  const errorMessage = error?.message || String(error);
  console.error('❌ Search error:', errorMessage);

  if (error instanceof SearchTimeoutError || 
      errorMessage.includes('57014') || 
      errorMessage.includes('statement canceled')) {
    toast({
      title: "Search Timeout",
      description: "The search took too long. Please try a more specific location.",
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Search Error",
    description: "We're having trouble searching. Please try again.",
    variant: "destructive",
  });
};

export const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new SearchTimeoutError(timeoutMessage)), timeoutMs)
    )
  ]);
};
