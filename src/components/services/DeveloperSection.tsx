
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ChartBar, Users, MessageSquare } from "lucide-react";
import { PricingTier } from "./PricingTier";

export const DeveloperSection = () => {
  const developerTiers = [
    {
      name: "Bronze",
      price: "£499/month",
      features: [
        { name: "Basic planning analytics", included: true },
        { name: "Community engagement tools", included: true },
        { name: "Advanced data insights", included: false },
        { name: "Dedicated account manager", included: false },
        { name: "API access", included: false },
      ],
    },
    {
      name: "Silver",
      price: "£999/month",
      features: [
        { name: "Basic planning analytics", included: true },
        { name: "Community engagement tools", included: true },
        { name: "Advanced data insights", included: true },
        { name: "Dedicated account manager", included: false },
        { name: "API access", included: false },
      ],
    },
    {
      name: "Gold",
      price: "£1,999/month",
      features: [
        { name: "Basic planning analytics", included: true },
        { name: "Community engagement tools", included: true },
        { name: "Advanced data insights", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "API access", included: true },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl">For Large Scale Developers</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Data-Driven Decisions</h3>
            <ul className="space-y-4">
              {[
                { icon: ChartBar, text: "Access comprehensive local planning data and trends" },
                { icon: Users, text: "Understand community sentiment before submission" },
                { icon: MessageSquare, text: "Engage with stakeholders through our platform" }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-primary mt-1" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-primary/5 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Enterprise Solutions</h3>
            <p className="text-gray-700 mb-6">
              Our platform provides valuable insights and streamlines community 
              engagement. Make informed decisions based on real data and local 
              sentiment analysis.
            </p>
            <Button size="lg" className="w-full md:w-auto">
              Book a Demo
            </Button>
          </div>
        </div>

        {/* Developer Pricing Tiers */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-8 text-center">Enterprise Packages</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {developerTiers.map((tier) => (
              <PricingTier
                key={tier.name}
                name={tier.name}
                price={tier.price}
                features={tier.features}
                ctaText="Contact Sales"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
