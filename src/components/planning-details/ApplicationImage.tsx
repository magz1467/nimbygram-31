
import { Application } from "@/types/planning";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getBestApplicationImage } from "@/utils/imageUtils";

interface ApplicationImageProps {
  application: Application;
}

// Category-specific image mapping - same as ImageResolver
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

export const ApplicationImage = ({ application }: ApplicationImageProps) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Use the helper function to get the best image
    const bestImage = getBestApplicationImage(application, CATEGORY_IMAGES);
    setImageSource(bestImage);
  }, [application]);

  return (
    <div className="w-full aspect-video relative overflow-hidden rounded-lg bg-gray-100">
      {imageSource && (
        <ImageWithFallback
          src={imageSource}
          alt={application.description || 'Planning application image'}
          className="object-cover w-full h-full"
          loading="eager"
          fallbackSrc={CATEGORY_IMAGES['Miscellaneous']}
        />
      )}
    </div>
  );
};
