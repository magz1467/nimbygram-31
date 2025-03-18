
import { Quote } from "lucide-react";

export const HeroTestimonial = () => {
  return (
    <div className="relative bg-white/50 rounded-lg p-6 mt-8 md:mt-4">
      {/* Large quote mark in the background */}
      <div className="absolute -top-4 md:-top-4 left-4 text-secondary/10">
        <Quote size={60} strokeWidth={1.5} />
      </div>
      <div className="absolute -bottom-4 right-4 text-secondary/10 transform rotate-180">
        <Quote size={60} strokeWidth={1.5} />
      </div>
      
      {/* Testimonial text */}
      <blockquote className="relative z-10 text-foreground font-playfair text-lg italic text-center px-8 font-bold">
        "By far the best information available online, so much better than endless reference numbers!"
      </blockquote>
    </div>
  );
};
