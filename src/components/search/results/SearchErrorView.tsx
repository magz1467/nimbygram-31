
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface SearchErrorViewProps {
  errorDetails: string | null;
  onRetry: () => void;
}

export const SearchErrorView = ({ errorDetails, onRetry }: SearchErrorViewProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <h2 className="text-2xl font-bold mb-4">Search Error</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {errorDetails || 'We had trouble finding planning applications for this location.'}
        </p>
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RotateCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
};
