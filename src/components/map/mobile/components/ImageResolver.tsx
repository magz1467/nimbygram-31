
import Image from '@/components/ui/image';

interface ImageResolverProps {
  imageMapUrl?: string;
  image?: string;
  title: string;
  applicationId: number;
  coordinates: [number, number];
  class_3?: string;
  className?: string;
}

export const ImageResolver = ({ 
  imageMapUrl, 
  image, 
  title,
  applicationId,
  coordinates,
  class_3,
  className = ''
}: ImageResolverProps) => {
  console.log('🖼️ ImageResolver rendering for:', {
    applicationId,
    hasImageMapUrl: !!imageMapUrl,
    hasImage: !!image,
    coordinates
  });

  return (
    <Image
      src={imageMapUrl || image || ''}
      alt={title}
      width={800}
      height={450}
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

