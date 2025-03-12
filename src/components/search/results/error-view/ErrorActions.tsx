
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface ErrorActionsProps {
  onRetry?: () => void;
}

export const ErrorActions = ({ onRetry }: ErrorActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {onRetry && (
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RotateCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
      <Button variant="outline" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
};
