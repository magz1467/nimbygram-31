
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Logo } from "./header/Logo";
import { MobileMenu } from "./header/MobileMenu";
import { NavigationMenu } from "./header/NavigationMenu";
import { PostcodeSearch } from "./postcode/PostcodeSearch";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [postcode, setPostcode] = useState("");
  
  // Paths where we should show the search bar in header
  const shouldShowSearch = [
    "/map", 
    "/search-results"
  ].some(path => location.pathname.includes(path));
  
  const handlePostcodeSelect = (selected: string, isLocationName = false) => {
    setPostcode(selected);
    if (selected) {
      navigate(`/search-results?postcode=${encodeURIComponent(selected)}`);
    }
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          <Logo />
          
          {!isMobile && <NavigationMenu />}
          
          {shouldShowSearch && (
            <div className="hidden md:block w-1/3 mx-4">
              <PostcodeSearch
                onSelect={handlePostcodeSelect}
                placeholder="Search new location"
                className="w-full"
              />
            </div>
          )}
          
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
