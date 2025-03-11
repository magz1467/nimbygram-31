
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
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  
  // Reset error state when src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  // Handle image error
  const handleError = () => {
    if (!hasError) {
      console.log(`⚠️ Image failed to load: ${src}, using fallback`);
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };
  
  // If src is undefined or empty, use fallback
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
