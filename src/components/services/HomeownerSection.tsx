
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, CheckCircle, MessageSquare } from "lucide-react";
import { PricingTier } from "./PricingTier";

export const HomeownerSection = () => {
  const homeownerTiers = [
    {
      name: "Bronze",
      price: "£49",
      features: [
        { name: "Basic planning guidance", included: true },
        { name: "Document templates", included: true },
        { name: "Community feedback", included: false },
        { name: "Planning officer consultation", included: false },
        { name: "Priority support", included: false },
      ],
    },
    {
      name: "Silver",
      price: "£149",
      features: [
        { name: "Basic planning guidance", included: true },
        { name: "Document templates", included: true },
        { name: "Community feedback", included: true },
        { name: "Planning officer consultation", included: false },
        { name: "Priority support", included: false },
      ],
    },
    {
      name: "Gold",
      price: "£299",
      features: [
        { name: "Basic planning guidance", included: true },
        { name: "Document templates", included: true },
        { name: "Community feedback", included: true },
        { name: "Planning officer consultation", included: true },
        { name: "Priority support", included: true },
      ],
    },
  ];

  return (
    <Card className="mb-12">
      <CardHeader>
        <div className="flex items-center gap-3 mb-4">
          <Home className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl">For Individual Homeowners</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Get it right the first time</h3>
            <ul className="space-y-4">
              {[
                { icon: Users, text: "Get early feedback from neighbors before submission" },
                { icon: CheckCircle, text: "Understand local planning policies and requirements" },
                { icon: MessageSquare, text: "Direct communication with planning officers" }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-primary mt-1" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-primary/5 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Why choose us?</h3>
            <p className="text-gray-700 mb-6">
              Our platform helps you navigate the planning process with confidence. 
              Get early feedback, make necessary adjustments, and increase your chances 
              of approval - all before official submission.
            </p>
            <Button size="lg" className="w-full md:w-auto">
              Start Your Application
            </Button>
          </div>
        </div>

        {/* Homeowner Pricing Tiers */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-8 text-center">Choose Your Package</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {homeownerTiers.map((tier) => (
              <PricingTier
                key={tier.name}
                name={tier.name}
                price={tier.price}
                features={tier.features}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
