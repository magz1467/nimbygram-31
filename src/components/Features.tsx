import { PenLine, Map, FileText } from "lucide-react";
import Image from "@/components/ui/image";

const Features = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-foreground font-playfair">
          The easy way to have your say on local developments
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <Image
              src="/lovable-uploads/2dfd74e5-fc91-48b5-bbeb-34d3332bd7d6.png"
              alt="Three women checking their phones in a picturesque village setting"
              className="rounded-xl shadow-lg w-full h-auto"
              width={600}
              height={600}
            />
          </div>

          {/* Features List Section */}
          <div className="space-y-8">
            <div className="flex items-start space-x-4 p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Instant petition</h3>
                <p className="text-foreground">Unleash your inner Nimby by creating a petition against ghastly developments</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Map className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Nimby or Yimby</h3>
                <p className="text-foreground">Upvote or downsvote applications</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <PenLine className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Easy Share</h3>
                <p className="text-foreground">Instantly share great or ghastly applications with your network to get more local feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;