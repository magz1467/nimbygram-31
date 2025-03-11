import Image from "@/components/ui/image";

export const HeroImage = () => {
  return (
    <div className="hidden md:flex items-center">
      <Image 
        src="/lovable-uploads/877d91fe-eb57-49a6-915a-a9d063ce98b1.png"
        alt="Couple standing in front of a countryside house" 
        className="rounded-lg shadow-xl w-[90%] h-auto object-cover"
        loading="eager"
        width={300}
        height={225}
      />
    </div>
  );
};