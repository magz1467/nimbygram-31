import { HeroContent } from "./hero/HeroContent";
import { HeroImage } from "./hero/HeroImage";

export const Hero = () => {
  return (
    <div className="bg-background py-8 md:py-16 font-sans">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <HeroContent />
          <HeroImage />
        </div>
      </div>
    </div>
  );
};