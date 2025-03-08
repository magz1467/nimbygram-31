
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface FeedbackCardProps {
  children: ReactNode;
  className?: string;
}

export const FeedbackCard = ({ children, className = "" }: FeedbackCardProps) => {
  return (
    <Card className={`p-4 hover:border-primary transition-colors ${className}`}>
      {children}
    </Card>
  );
};
