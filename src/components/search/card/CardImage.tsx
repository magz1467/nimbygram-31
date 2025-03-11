
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
    // Return a div with a placeholder instead of null
    return (
      <div className={`relative w-full aspect-[4/3] bg-gray-100 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      </div>
    );
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
