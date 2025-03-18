import { FC } from 'react';
import { Button } from "@/components/ui/button";

interface PetitionButtonProps {
  onClick: () => void;
}

export const PetitionButton: FC<PetitionButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="default"
      className="w-full mt-8 bg-secondary hover:bg-secondary/90 text-white py-6 text-lg font-semibold"
      onClick={onClick}
    >
      Start Your Petition →
    </Button>
  );
};