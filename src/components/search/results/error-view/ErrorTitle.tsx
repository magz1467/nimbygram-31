
import { ErrorType } from "@/utils/errors";

interface ErrorTitleProps {
  errorType: ErrorType;
  isWendoverPostcode: boolean;
}

export const ErrorTitle = ({ errorType, isWendoverPostcode }: ErrorTitleProps) => {
  if (isWendoverPostcode) return <h2 className="text-2xl font-bold mb-4">Wendover Area Search Timeout</h2>;
  
  switch (errorType) {
    case ErrorType.NETWORK:
      return <h2 className="text-2xl font-bold mb-4">Connection Problem</h2>;
    case ErrorType.TIMEOUT:
      return <h2 className="text-2xl font-bold mb-4">Search Timeout</h2>;
    case ErrorType.NOT_FOUND:
      return <h2 className="text-2xl font-bold mb-4">No Results Found</h2>;
    default:
      return <h2 className="text-2xl font-bold mb-4">Search Error</h2>;
  }
};
