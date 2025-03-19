
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface FeatureItem {
  name: string;
  included: boolean;
}

interface PricingTierProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  highlighted?: boolean;
}

export const PricingTier = ({ 
  title, 
  price,
  period = "",
  description,
  features,
  buttonText,
  buttonVariant = "default",
  highlighted = false
}: PricingTierProps) => {
  return (
    <Card className={`relative overflow-hidden ${highlighted ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-3xl font-bold mt-2">
          {price}
          <span className="text-sm font-normal text-gray-500">{period}</span>
        </p>
        <p className="text-gray-600 mt-2">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full mt-6 ${highlighted ? 'bg-primary hover:bg-primary/90' : ''}`} 
          variant={buttonVariant}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
