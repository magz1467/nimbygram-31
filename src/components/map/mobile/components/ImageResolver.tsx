import { useState, useEffect } from 'react';

// Category-specific image mapping - same as ApplicationImage
const CATEGORY_IMAGES = {
  'Demolition': '/lovable-uploads/7448dbb9-9558-4d5b-abd8-b9a086dc632c.png',
  'Extension': '/lovable-uploads/b0296cbb-48ab-46ec-9ac1-93c1251ca198.png',
  'New Build': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=60',
  'Change of Use': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=60',
  'Listed Building': 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&auto=format&fit=crop&q=60',
  'Commercial': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
  'Residential': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
  'Infrastructure': 'https://images.unsplash.com/photo-1621955964441-c173e01c135b?w=800&auto=format&fit=crop&q=60',
  'Planning Conditions': '/lovable-uploads/c5f375f5-c862-4a11-a43e-7dbac6a9085a.png',
  'Miscellaneous': '/lovable-uploads/ce773ff2-12e2-463a-b81e-1042a334d0cc.png'
};

interface ImageResolverProps {
  imageMapUrl: string | null;
  image: string | undefined;
  title: string;
  applicationId: number;
  coordinates?: [number, number];
  class_3?: string | null;
}

export const ImageResolver = ({ 
  imageMapUrl, 
  image, 
  title,
  applicationId,
  coordinates,
  class_3 
}: ImageResolverProps) => {
  const [currentImageSource, setCurrentImageSource] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when props change
    setHasError(false);

    // First try the streetview image
    if (image) {
      setCurrentImageSource(image);
      return;
    }

    // Then try to determine category from title if class_3 is not set
    let detectedCategory = class_3;
    if (!detectedCategory && title) {
      const titleLower = title.toLowerCase();
      if (titleLower.includes('demolition')) {
        detectedCategory = 'Demolition';
      } else if (titleLower.includes('extension')) {
        detectedCategory = 'Extension';
      } else if (titleLower.includes('new build')) {
        detectedCategory = 'New Build';
      } else if (titleLower.includes('change of use')) {
        detectedCategory = 'Change of Use';
      } else if (titleLower.includes('listed building')) {
        detectedCategory = 'Listed Building';
      }
    }
    
    // Use category image if available
    if (detectedCategory && CATEGORY_IMAGES[detectedCategory as keyof typeof CATEGORY_IMAGES]) {
      setCurrentImageSource(CATEGORY_IMAGES[detectedCategory as keyof typeof CATEGORY_IMAGES]);
      return;
    }

    // Finally use miscellaneous category image as fallback
    setCurrentImageSource(CATEGORY_IMAGES['Miscellaneous']);
  }, [image, imageMapUrl, applicationId, class_3, title]);

  const handleImageError = () => {
    console.log('ImageResolver - Error loading image:', currentImageSource);
    setHasError(true);
    setCurrentImageSource(CATEGORY_IMAGES['Miscellaneous']);
  };

  if (!currentImageSource || hasError) {
    return (
      <img
        src={CATEGORY_IMAGES['Miscellaneous']}
        alt={title}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    );
  }

  return (
    <img
      src={currentImageSource}
      alt={title}
      className="w-full h-full object-cover"
      onError={handleImageError}
    />
  );
};
