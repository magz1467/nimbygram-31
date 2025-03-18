
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface FeatureItem {
  name: string;
  included: boolean;
}

interface PricingTierProps {
  name: string;
  price: string;
  features: FeatureItem[];
  ctaText?: string;
}

export const PricingTier = ({ 
  name, 
  price, 
  features, 
  ctaText = "Get Started" 
}: PricingTierProps) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{name}</CardTitle>
        <p className="text-3xl font-bold mt-2">{price}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              {feature.included ? (
                <Check className="h-5 w-5 text-primary" />
              ) : (
                <X className="h-5 w-5 text-gray-300" />
              )}
              <span className={feature.included ? "" : "text-gray-500"}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
        <Button className="w-full mt-6">{ctaText}</Button>
      </CardContent>
    </Card>
  );
};
