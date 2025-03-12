
import { Search, RotateCw, AlertTriangle, WifiOff, Clock, MapPin } from "lucide-react";
import { ErrorType } from "@/utils/errors";

interface ErrorIconProps {
  errorType: ErrorType;
  size?: "sm" | "lg";
  isLocationTimeout?: boolean;
}

export const ErrorIcon = ({ errorType, size = "lg", isLocationTimeout }: ErrorIconProps) => {
  const iconSize = size === "lg" ? "h-16 w-16" : "h-5 w-5";
  
  switch (errorType) {
    case ErrorType.NETWORK:
      return <WifiOff className={`${iconSize} text-red-500`} />;
    case ErrorType.TIMEOUT:
      return isLocationTimeout ? 
        <MapPin className={`${iconSize} text-amber-500`} /> : 
        <Clock className={`${iconSize} text-amber-500`} />;
    case ErrorType.NOT_FOUND:
      return <Search className={`${iconSize} text-blue-500`} />;
    default:
      return <AlertTriangle className={`${iconSize} text-red-500`} />;
  }
};
