import { useState } from "react";
import { FALLBACK_IMAGE } from "@/utils/imageUtils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback = ({ 
  src, 
  alt = '', 
  fallbackSrc = FALLBACK_IMAGE,
  className = '',
  ...props 
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);
  
  return (
    <img
      src={error || !src ? fallbackSrc : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};