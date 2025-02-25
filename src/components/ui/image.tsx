
import { useState } from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  "https://images.unsplash.com/photo-1518770660439-4636190af475"
];

const Image = ({ src, alt, className, width, height, loading = "lazy", ...props }: ImageProps) => {
  const [error, setError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  
  const handleError = () => {
    if (fallbackIndex < FALLBACK_IMAGES.length - 1) {
      setFallbackIndex(prev => prev + 1);
    } else {
      setError(true);
    }
  };

  // Only use fallback if src is null/undefined/"null" string or if there's an error
  const imageSrc = !src || src === "null" || error ? 
    (error ? 
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 60 L70 40' stroke='%23999' fill='none' stroke-width='2'/%3E%3Cpath d='M30 50 L50 70 L70 50' stroke='%23999' fill='none' stroke-width='2'/%3E%3C/svg%3E" :
      FALLBACK_IMAGES[fallbackIndex]
    ) : 
    src;
  
  return (
    <img
      src={imageSrc}
      alt={alt || ''}
      className={className || ''}
      onError={handleError}
      loading={loading}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default Image;
