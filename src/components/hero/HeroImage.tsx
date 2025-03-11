
import Image from "@/components/ui/image";

export const HeroImage = () => {
  return (
    <div className="hidden md:flex items-center">
      <Image 
        src="/lovable-uploads/26ba5eea-80ae-45a6-bd31-5afb74bbcc15.png"
        alt="Couple standing in front of a countryside house" 
        className="rounded-lg shadow-xl w-[90%] h-auto object-cover"
        loading="eager"
        width={300}
        height={225}
      />
    </div>
  );
};
