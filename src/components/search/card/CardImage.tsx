
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getImageUrl } from "@/utils/imageUtils";

interface CardImageProps {
  imageUrl?: string | null;
  title: string;
  className?: string;
}

export const CardImage = ({ imageUrl, title, className = "" }: CardImageProps) => {
  const processedImageUrl = imageUrl ? getImageUrl(imageUrl) : null;

  if (!processedImageUrl) {
    return null;
  }
  
  return (
    <div className={`relative w-full aspect-[4/3] ${className}`}>
      <ImageWithFallback
        src={processedImageUrl}
        alt={title}
        className="w-full h-full object-cover rounded-md"
        fallbackSrc="/placeholder.svg"
      />
    </div>
  );
};
