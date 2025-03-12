
import { Stats } from "@/components/Stats";
import { SearchForm } from "@/components/SearchForm";
import { HeroTitle } from "./HeroTitle";
import { HeroSubtitle } from "./HeroSubtitle";
import { HeroTestimonial } from "./HeroTestimonial";
import Image from "@/components/ui/image";

export const HeroContent = () => {
  return (
    <div className="space-y-3">
      <HeroTitle />
      <HeroSubtitle />
      <div className="md:bg-white md:rounded-xl md:shadow-sm md:p-2">
        <Stats />
      </div>
      <div className="md:hidden mb-4">
        <Image 
          src="/lovable-uploads/26ba5eea-80ae-45a6-bd31-5afb74bbcc15.png"
          alt="Couple standing in front of a countryside house" 
          className="rounded-lg shadow-sm w-full h-[300px] object-cover"
          loading="eager"
          width={300}
          height={200}
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm p-2">
        <SearchForm />
      </div>
      <HeroTestimonial />
    </div>
  );
};
