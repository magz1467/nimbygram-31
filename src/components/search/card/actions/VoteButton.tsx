
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoteButtonProps {
  type: 'hot' | 'not';
  count: number;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export const VoteButton = ({ 
  type, 
  count, 
  isActive, 
  isDisabled, 
  onClick 
}: VoteButtonProps) => {
  const Icon = type === 'hot' ? ThumbsUp : ThumbsDown;
  const label = type === 'hot' ? 'Hot' : 'Not';
  
  const activeClass = isActive ? 'text-primary bg-primary/10' : '';
  const hoverClass = type === 'hot' ? 'hover:bg-[#F2FCE2] hover:text-primary' : '';

  return (
    <Button 
      variant="ghost" 
      size="sm"
      disabled={isDisabled}
      className={`flex flex-col items-center gap-1 h-auto py-2 rounded-md ${activeClass} ${hoverClass} transition-colors`}
      onClick={onClick}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
            {count}
          </span>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </Button>
  );
};
