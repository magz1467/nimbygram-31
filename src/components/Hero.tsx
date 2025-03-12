
import { HeroContent } from "./hero/HeroContent";
import { HeroImage } from "./hero/HeroImage";

export const Hero = () => {
  return (
    <section className="py-8 md:py-12 lg:py-16 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <HeroContent />
          <div className="hidden md:block">
            <HeroImage />
          </div>
        </div>
      </div>
    </section>
  );
};
