import { Quote } from "lucide-react";

export const QuoteSection = () => {
  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="relative bg-background rounded-lg p-6">
          {/* Large quote mark in the background */}
          <div className="absolute -top-4 md:-top-4 left-4 text-secondary/10">
            <Quote size={60} />
          </div>
          <div className="absolute -bottom-4 right-4 text-secondary/10 transform rotate-180">
            <Quote size={60} />
          </div>
          
          {/* Quote text */}
          <blockquote className="relative z-10 text-foreground font-playfair text-xl md:text-2xl italic text-center px-8 font-bold">
            "I don't have the time to get my information from posters stuck on lamp posts! Nimbygram finally makes it easy to see what's going on in my area."
          </blockquote>
        </div>
      </div>
    </div>
  );
};