
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface VoteButtonProps {
  type: 'yimby' | 'nimby';
  count: number;
  isActive: boolean;
  imageSrc: string;
  onClick: () => void;
  isSubmitting: boolean;
  isMobile: boolean;
}

export const VoteButton = ({
  type,
  count,
  isActive,
  imageSrc,
  onClick,
  isSubmitting,
  isMobile
}: VoteButtonProps) => {
  if (isMobile) {
    return (
      <Button
        variant={isActive ? "default" : "outline"}
        onClick={onClick}
        disabled={isSubmitting}
        className={`flex items-center gap-2 flex-1 hover:scale-105 transition-transform ${
          isActive && type === 'yimby' ? 'bg-primary hover:bg-primary-dark' : 
          isActive && type === 'nimby' ? 'bg-[#ea384c]/10' : 
          type === 'yimby' ? 'hover:bg-primary/10' : ''
        }`}
      >
        <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-${
          type === 'yimby' ? 'primary' : '[#ea384c]'
        } transition-all`}>
          <ImageWithFallback
            src={imageSrc}
            alt={type === 'yimby' ? "YIMBY" : "NIMBY"}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-semibold">{count}</span>
      </Button>
    );
  }

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      onClick={onClick}
      disabled={isSubmitting}
      className={`flex-1 flex items-center gap-3 justify-start h-auto p-3 hover:scale-105 transition-transform ${
        isActive && type === 'yimby' ? 'bg-primary hover:bg-primary-dark' : 
        isActive && type === 'nimby' ? 'bg-[#ea384c]/10' : 
        type === 'yimby' ? 'hover:bg-primary/10' : ''
      }`}
    >
      <div className={`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-${
        type === 'yimby' ? 'primary' : '[#ea384c]'
      } transition-all`}>
        <ImageWithFallback
          src={imageSrc}
          alt={type === 'yimby' ? "YIMBY" : "NIMBY"}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-lg font-semibold">{count}</span>
        <span className={`text-sm ${
          isActive && type === 'yimby' ? 'text-white' : 'text-gray-500'
        }`}>people said {type === 'yimby' ? 'YES!' : 'NO!'}</span>
      </div>
    </Button>
  );
};
