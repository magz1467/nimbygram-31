import React from 'react';

interface ImageResolverProps {
  imageMapUrl: string | null;
  coordinates: [number, number] | null;
  alt?: string;
}

const ImageResolver: React.FC<ImageResolverProps> = ({ 
  imageMapUrl, 
  coordinates, 
  alt = 'Map image' 
}) => {
  // If no image URL is provided, show a placeholder
  if (!imageMapUrl) {
    return <div className="image-placeholder">No image available</div>;
  }

  // If coordinates are provided, we can show a marker
  if (coordinates) {
    return (
      <div className="image-with-marker">
        <img src={imageMapUrl} alt={alt} />
        <div 
          className="marker" 
          style={{ 
            left: `${coordinates[0]}%`, 
            top: `${coordinates[1]}%` 
          }}
        />
      </div>
    );
  }

  // Otherwise, just show the image
  return <img src={imageMapUrl} alt={alt} />;
};

export default ImageResolver; 