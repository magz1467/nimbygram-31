
import { FC } from 'react';
import { Button } from "@/components/ui/button";
import "../../styles/components/petition-button.css";

interface PetitionButtonProps {
  onClick: () => void;
}

export const PetitionButton: FC<PetitionButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="default"
      className="petition-button"
      onClick={onClick}
    >
      Start Your Petition →
    </Button>
  );
};
