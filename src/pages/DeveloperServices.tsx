
import Footer from "@/components/Footer";
import { HomeownerSection } from "@/components/services/HomeownerSection";
import { DeveloperSection } from "@/components/services/DeveloperSection";

const DeveloperServices = () => {
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
          <HomeownerSection />

          {/* Large Scale Developers Section */}
          <DeveloperSection />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DeveloperServices;
