
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Shield, FileText, Bell } from "lucide-react";
import { PricingTier } from "./PricingTier";

export const HomeownerSection = () => {
  return (
    <section className="py-16 bg-white" id="homeowner-services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Homeowner Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Protect your property value and quality of life with our comprehensive
            homeowner services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Home className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Property Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Be alerted to nearby developments that could impact your property's value
                or your quality of life.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Planning Defense</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Expert guidance on objecting to problematic developments and navigating
                the planning process.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Legal Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access to templates, guides, and professional advice for addressing
                planning concerns legally.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Alerts System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Customizable notifications about new planning applications in your
                neighborhood and surrounding areas.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingTier
            title="Basic"
            price="Free"
            period=""
            description="Essential tools for homeowners"
            features={[
              "Basic property alerts",
              "Access to planning database",
              "Limited objection templates",
              "Community forum access"
            ]}
            buttonText="Get Started"
            buttonVariant="outline"
          />

          <PricingTier
            title="Premium"
            price="£9.99"
            period="/month"
            description="Advanced protection for your property"
            features={[
              "Priority property alerts",
              "Advanced impact assessment",
              "Full objection template library",
              "Expert planning advice",
              "Legal consultation discount"
            ]}
            buttonText="Start Free Trial"
            buttonVariant="default"
            highlighted={true}
          />

          <PricingTier
            title="Community"
            price="Custom"
            period=""
            description="Organize your neighborhood"
            features={[
              "Group coverage for multiple homes",
              "Coordinated planning responses",
              "Community campaign tools",
              "Dedicated planning consultant",
              "Neighborhood alert system",
              "Legal strategy sessions"
            ]}
            buttonText="Contact Sales"
            buttonVariant="outline"
          />
        </div>

        <div className="text-center mt-12">
          <Button variant="link" className="text-primary">
            View full feature comparison →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeownerSection;
