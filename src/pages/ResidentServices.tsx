
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Image from "@/components/ui/image";
import { NewsletterCard } from "@/components/stay-up-to-date/NewsletterCard";
import { PageSeparator } from "@/components/ui/page-separator";

const ResidentServices = () => {
  return (
    <>
      <PageSeparator />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h1 className="text-4xl font-bold mb-6 text-primary">
                  Empowering Local Residents
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                  Access the same powerful tools and insights that big developers use. Our platform brings transparency and equal opportunity to local planning decisions.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="h-6 w-6 mr-3 text-primary">✓</div>
                    <p>Real-time notifications about planning applications in your area</p>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 mr-3 text-primary">✓</div>
                    <p>Advanced mapping technology to visualize developments</p>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 mr-3 text-primary">✓</div>
                    <p>Direct communication channel with developers and councils</p>
                  </div>
                </div>
                <Link to="/map">
                  <Button size="lg" className="w-full md:w-auto">
                    View Local Applications
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl transform rotate-3"></div>
                <Image
                  src="/lovable-uploads/2ddbeeaf-9458-4cc2-ba2f-cf2da75ae103.png"
                  alt="Local residents looking at countryside property"
                  className="rounded-2xl shadow-lg relative z-10 object-center"
                  width={800}
                  height={600}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16 mb-16">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Stay Informed</h3>
                <p className="text-gray-600">
                  Get instant notifications about new planning applications in your area. No more surprises about local developments.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Make Your Voice Heard</h3>
                <p className="text-gray-600">
                  Submit feedback directly through our platform. Your opinions matter and help shape your community's future.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Data-Driven Insights</h3>
                <p className="text-gray-600">
                  Access detailed analytics and historical data to make informed decisions about local developments.
                </p>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6">Stay Updated with Planning Trends</h2>
              <p className="text-gray-600 text-center mb-8">
                Join our monthly newsletter to receive expert insights, local planning updates, and community engagement opportunities.
              </p>
              <NewsletterCard />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ResidentServices;
