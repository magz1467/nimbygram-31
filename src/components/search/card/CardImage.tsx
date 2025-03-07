
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getImageUrl } from "@/utils/imageUtils";

interface CardImageProps {
  imageUrl?: string | null;
  title: string;
}

export const CardImage = ({ imageUrl, title }: CardImageProps) => {
  if (!imageUrl) return null;
  
  // Process the image URL through our utility function
  const processedImageUrl = getImageUrl(imageUrl);

  return (
    <div className="relative w-full aspect-[4/3]">
      <ImageWithFallback
        src={processedImageUrl}
        alt={title}
        className="w-full h-full object-cover rounded-md"
        fallbackSrc="/placeholder.svg"
      />
    </div>
  );
};
