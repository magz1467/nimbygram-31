import { useEffect } from "react";
import { ContactSection } from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Building, BarChart2, Megaphone, Newspaper, User } from "lucide-react";

const Press = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Press & Media</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming the UK planning industry through technology and transparency
          </p>
        </div>

        {/* Key Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <User className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Empowering Residents</h3>
            <p className="text-gray-600">
              Providing clear, accessible insights into local planning changes, 
              enabling informed community participation in the development process.
            </p>
          </div>

          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Building className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Industry Innovation</h3>
            <p className="text-gray-600">
              Revolutionizing planning processes through cutting-edge technology, 
              making information more accessible and decision-making more transparent.
            </p>
          </div>

          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <BarChart2 className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Measurable Impact</h3>
            <p className="text-gray-600">
              Driving positive change in communities with data-driven insights 
              and improved engagement in local planning decisions.
            </p>
          </div>
        </div>

        {/* Latest News */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <Newspaper className="w-8 h-8 mr-3 text-primary" />
            Latest News
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-100"></div>
              <div className="p-6">
                <span className="text-sm text-primary font-semibold">March 2024</span>
                <h3 className="text-xl font-semibold mt-2 mb-3">
                  PlanningPulse Launches Nationwide Coverage
                </h3>
                <p className="text-gray-600">
                  Our platform now covers planning applications across all UK local authorities, 
                  marking a significant milestone in our mission to democratize planning information.
                </p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-100"></div>
              <div className="p-6">
                <span className="text-sm text-primary font-semibold">February 2024</span>
                <h3 className="text-xl font-semibold mt-2 mb-3">
                  Community Engagement Reaches New Heights
                </h3>
                <p className="text-gray-600">
                  Record number of residents actively participating in local planning 
                  discussions through our platform, showcasing the power of accessible information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Press Contact */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <Megaphone className="w-8 h-8 mr-3 text-primary" />
            Press Contact
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <ContactSection
              title="Media Enquiries"
              description="For press releases, interview requests, and media information"
              email="press@planningpulse.com"
            />
            <ContactSection
              title="Speaking Opportunities"
              description="For conference appearances, webinars, and expert commentary"
              email="speakers@planningpulse.com"
            />
          </div>
        </div>

        {/* Press Kit */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Press Kit</h2>
          <p className="text-gray-600 mb-6">
            Download our press kit for logos, brand guidelines, and high-resolution images
          </p>
          <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
            Download Press Kit
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Press;