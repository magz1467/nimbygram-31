import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, BarChart, Users, MessageSquare } from "lucide-react";
import { PricingTier } from "./PricingTier";

export const DeveloperSection = () => {
  return (
    <section className="py-16 bg-gray-50" id="developer-services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Developer Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools and data for real estate developers to make informed decisions
            and streamline project planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Project Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access zoning data, development patterns, and historical approval rates to plan your projects effectively.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive market data including pricing trends, demand forecasts, and competitive landscape analysis.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Community Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Understand community sentiment and anticipate potential opposition to development projects.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Approval Consulting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Strategic advice on navigating approval processes and addressing community concerns effectively.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingTier
            title="Basic"
            price="$299"
            period="/month"
            description="Essential tools for small developers"
            features={[
              "Basic zoning data access",
              "Limited market reports",
              "Community sentiment analysis",
              "Email support"
            ]}
            buttonText="Start Free Trial"
            buttonVariant="outline"
          />

          <PricingTier
            title="Professional"
            price="$799"
            period="/month"
            description="Comprehensive tools for growing firms"
            features={[
              "Full zoning database access",
              "Comprehensive market analysis",
              "Historical approval data",
              "Community engagement tools",
              "Priority support"
            ]}
            buttonText="Start Free Trial"
            buttonVariant="default"
            highlighted={true}
          />

          <PricingTier
            title="Enterprise"
            price="Custom"
            period=""
            description="Tailored solutions for large developers"
            features={[
              "Custom data integration",
              "Advanced predictive analytics",
              "Dedicated consulting services",
              "API access",
              "24/7 premium support",
              "Custom reporting"
            ]}
            buttonText="Contact Sales"
            buttonVariant="outline"
          />
        </div>

        <div className="text-center mt-12">
          <Button variant="link" className="text-blue-600">
            View full feature comparison →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;
