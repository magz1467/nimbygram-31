import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative p-2.5 hover:bg-primary/10 transition-colors rounded-lg bg-primary/5"
        >
          <Menu className="h-8 w-8 text-primary" strokeWidth={2.5} />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto max-h-screen pt-12">
        <div className="text-xl font-bold text-primary pb-4 mb-6 border-b sticky top-0 bg-background z-10">
          Menu
        </div>
        <nav className="flex flex-col gap-4 pb-safe">
          <Link to="/about" className="text-lg">
            About
          </Link>
          <Link to="/services/residents" className="text-lg">
            Resident Services
          </Link>
          <Link to="/services/developers" className="text-lg">
            Developer Services
          </Link>
          <Link to="/services/councils" className="text-lg">
            Council Services
          </Link>
          <Link to="/contact" className="text-lg">
            Contact
          </Link>

          <div className="h-px bg-gray-200 my-4" />
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-semibold">
              Planning Guides
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <Link to="/content/planning-basics" className="block text-base pl-2">
                Planning Basics
              </Link>
              <Link to="/content/local-plans" className="block text-base pl-2">
                Local Plans
              </Link>
              <Link to="/content/sustainable-development" className="block text-base pl-2">
                Sustainable Development
              </Link>
              <Link to="/content/planning-appeals" className="block text-base pl-2">
                Planning Appeals
              </Link>
              <Link to="/content/heritage-conservation" className="block text-base pl-2">
                Heritage & Conservation
              </Link>
            </CollapsibleContent>
          </Collapsible>

          <div className="h-px bg-gray-200 my-4" />
          
          <Link to="/auth">
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
              Sign In
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="default" className="w-full">
              Create Account
            </Button>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};