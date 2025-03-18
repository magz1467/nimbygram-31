import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "@/components/ui/image";
import GetInTouch from "@/components/GetInTouch";

const About = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Hero section with title and intro */}
            <div className="mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                About Nimbygram
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nimbygram is revolutionizing the way communities engage with local planning applications. Our platform bridges the gap between residents, developers, and local authorities, making the planning process more transparent and efficient.
              </p>
            </div>

            {/* Our Vision section */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="bg-white rounded-xl shadow-sm p-8 space-y-4 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-semibold text-primary">Our Vision</h2>
                <p className="text-lg text-gray-600">
                  We envision a future where planning decisions are made collaboratively, with genuine input from all stakeholders. By leveraging technology, we're making this vision a reality.
                </p>
              </div>
              <div>
                <Image
                  src="/lovable-uploads/86ad94f3-f27f-4a04-898c-eca329e3ff65.png"
                  alt="Community members using mobile phones to engage with planning applications"
                  className="rounded-2xl shadow-xl w-full h-[300px] object-cover"
                  width={500}
                  height={300}
                />
              </div>
            </div>

            {/* Our Impact section - Alternated layout */}
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <Image
                  src="/lovable-uploads/2c0140af-5067-4789-85ab-48d4476e179c.png"
                  alt="Professional team standing in front of a rural property"
                  className="rounded-2xl shadow-xl w-full h-[300px] object-cover"
                  width={500}
                  height={300}
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm p-8 space-y-4 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-semibold text-primary">Our Impact</h2>
                <p className="text-lg text-gray-600">
                  Since our launch, we've helped thousands of residents have their say on local developments, while helping developers better understand community needs and concerns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Get In Touch section */}
        <GetInTouch />
      </div>
      <Footer />
    </>
  );
};

export default About;