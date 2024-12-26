import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "@/components/ui/image";

const About = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-[#F1F0FB] to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Hero section with title and intro */}
            <div className="mb-16 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-[#9b87f5] bg-clip-text text-transparent mb-6">
                About PlanningPulse
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                PlanningPulse is revolutionizing the way communities engage with local planning applications. Our platform bridges the gap between residents, developers, and local authorities, making the planning process more transparent and efficient.
              </p>
            </div>

            {/* Vision section with first image */}
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
              <div className="lg:w-1/2">
                <div className="bg-white rounded-xl shadow-sm p-8 space-y-4 hover:shadow-md transition-shadow">
                  <h2 className="text-2xl font-semibold text-primary">Our Vision</h2>
                  <p className="text-lg text-gray-600">
                    We envision a future where planning decisions are made collaboratively, with genuine input from all stakeholders. By leveraging technology, we're making this vision a reality.
                  </p>
                </div>
              </div>

              <div className="lg:w-1/2">
                <Image
                  src="/lovable-uploads/334551c0-9c95-45dc-ac93-6a0c71f0d7c6.png"
                  alt="Community planning meeting with diverse group of people discussing and collaborating"
                  className="rounded-2xl shadow-xl w-full h-[300px] object-cover"
                  width={500}
                  height={300}
                />
              </div>
            </div>

            {/* Impact section with second image */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <Image
                  src="/lovable-uploads/59df3d90-4a1f-40be-bd8f-211e7adbabe6.png"
                  alt="Diverse group of professionals having a discussion"
                  className="rounded-2xl shadow-xl w-full h-[300px] object-cover"
                  width={500}
                  height={300}
                />
              </div>

              <div className="lg:w-1/2">
                <div className="bg-white rounded-xl shadow-sm p-8 space-y-4 hover:shadow-md transition-shadow">
                  <h2 className="text-2xl font-semibold text-[#7E69AB]">Our Impact</h2>
                  <p className="text-lg text-gray-600">
                    Since our launch, we've helped thousands of residents have their say on local developments, while helping developers better understand community needs and concerns.
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

export default About;