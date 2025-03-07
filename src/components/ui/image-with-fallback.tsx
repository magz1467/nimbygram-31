
import { useState, useEffect } from "react";
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
  const [imgSrc, setImgSrc] = useState<string>(src || '');
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Reset error state when src changes
    if (src) {
      setImgSrc(src);
      setError(false);
    }
  }, [src]);

  const handleError = () => {
    if (!error) {
      console.log(`Image failed to load: ${imgSrc}, using fallback`);
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };
  
  return (
    <img
      src={error ? fallbackSrc : imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="eager" // Force eager loading for mobile
      {...props}
    />
  );
};
