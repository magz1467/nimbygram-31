
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Users, ChartBar, MessageSquare, CheckCircle, X, Check } from "lucide-react";
import { Link } from "react-router-dom";

const DeveloperServices = () => {
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
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">Planning Made Simple</h1>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Whether you're a homeowner planning an extension or a large-scale developer,
            we're here to streamline your planning process.
          </p>

          {/* Individual Homeowners Section */}
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
                    <Card key={tier.name} className="relative overflow-hidden">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                        <p className="text-3xl font-bold mt-2">{tier.price}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {tier.features.map((feature, index) => (
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
                        <Button className="w-full mt-6">Get Started</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Large Scale Developers Section */}
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
                    <Card key={tier.name} className="relative overflow-hidden">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                        <p className="text-3xl font-bold mt-2">{tier.price}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {tier.features.map((feature, index) => (
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
                        <Button className="w-full mt-6">Contact Sales</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DeveloperServices;
