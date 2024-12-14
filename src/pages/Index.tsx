import { SearchForm } from "@/components/SearchForm";
import { Stats } from "@/components/Stats";
import { Search, MessageSquare, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-primary">The smarter way</span> to track planning applications
              </h1>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                Have your say on planning applications in your area.
              </p>
              <Stats />
              <SearchForm />
            </div>
            
            <div className="hidden md:block">
              <img 
                src="/placeholder.svg"
                alt="Architect reviewing development plans" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              The easy way to have your say on local developments
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <Search className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">1. Easily search and view local applications</h3>
                <p className="text-gray-600">Find and explore planning applications in your area with our simple search tools.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">2. Easily comment and feedback to the developer</h3>
                <p className="text-gray-600">Share your thoughts and concerns directly with developers through our platform.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <Send className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">3. Feedback automatically submitted to the local authority</h3>
                <p className="text-gray-600">Your feedback is automatically forwarded to the relevant local authority for consideration.</p>
              </div>
            </div>
          </div>

          <div className="mt-24 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Our Mission
            </h2>
            <div className="space-y-6 text-gray-600">
              <p className="text-lg">
                The UK planning system has long been burdened by slow processes, limited transparency, and inefficient communication between stakeholders. With average application decisions taking 8-13 weeks, and major developments often extending beyond 6 months, the need for innovation is clear.
              </p>
              <p className="text-lg">
                Our platform revolutionizes this outdated system by creating a seamless digital bridge between residents, developers, and local authorities. By streamlining communication and providing real-time updates, we're reducing decision times while improving the quality of community engagement.
              </p>
              <p className="text-lg">
                Through data-driven insights and transparent processes, we're building a future where planning decisions are made faster, smarter, and with genuine community input. Our goal is to reduce planning decision times by 40% while ensuring every voice is heard.
              </p>
            </div>
          </div>

          <div className="mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src="/photo-1581091226825-a6a2a5aee158"
                  alt="Resident using the platform"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">For Residents</h3>
                  <p className="text-gray-600">
                    Easily comment for free on local developments. Stay informed and have your say on changes in your community.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src="/photo-1486312338219-ce68d2c6f44d"
                  alt="Developer reviewing feedback"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">For Developers</h3>
                  <p className="text-gray-600">
                    Get feedback on your project before decision day. Easily see other developments in the area and understand community sentiment.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src="/photo-1487058792275-0ad4aaf24ca7"
                  alt="Local authority dashboard"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">For Local Authorities</h3>
                  <p className="text-gray-600">
                    Automate and accelerate your planning process. Streamline communication between residents and developers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Index;
