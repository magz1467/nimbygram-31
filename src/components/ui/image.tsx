
import { useState } from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 60 L70 40' stroke='%23999' fill='none' stroke-width='2'/%3E%3Cpath d='M30 50 L50 70 L70 50' stroke='%23999' fill='none' stroke-width='2'/%3E%3C/svg%3E";

const Image = ({ src, alt, className, width, height, loading = "lazy", ...props }: ImageProps) => {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? FALLBACK_IMAGE : src}
      alt={alt || ''}
      className={className || ''}
      onError={() => setError(true)}
      loading={loading}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default Image;

