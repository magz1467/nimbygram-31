
import { HeroContent } from "@/components/hero/HeroContent";
import { HeroImage } from "@/components/hero/HeroImage";

export const Hero = () => {
  return (
    <div className="bg-background py-8 md:py-16 font-sans w-full">
      <div className="w-full px-0 md:container md:mx-auto md:px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center px-4 md:px-0">
          <HeroContent />
          <HeroImage />
        </div>
      </div>
    </div>
  );
};
