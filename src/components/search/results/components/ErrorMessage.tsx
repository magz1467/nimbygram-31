
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ title, message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="py-16 text-center max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RotateCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};
