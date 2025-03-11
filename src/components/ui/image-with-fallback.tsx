
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
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [hasError, setHasError] = useState(false);
  
  // Initialize and reset error state when src changes
  useEffect(() => {
    // Validate source before setting
    if (src && src !== 'undefined' && src !== 'null' && src.trim() !== '') {
      setImgSrc(src);
      setHasError(false);
    } else {
      // Use fallback immediately for invalid sources
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  }, [src, fallbackSrc]);

  // Handle image error
  const handleError = () => {
    if (!hasError) {
      console.log(`⚠️ Image failed to load: ${src}, using fallback`);
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };
  
  // Default to fallback if no valid source
  if (!imgSrc || imgSrc === 'undefined' || imgSrc === 'null' || imgSrc.trim() === '') {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};
