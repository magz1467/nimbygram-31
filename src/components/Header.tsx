
import { useLocation } from "react-router-dom";
import { Logo } from "./header/Logo";
import { MobileMenu } from "./header/MobileMenu";

export const Header = () => {
  const location = useLocation();

  return (
    <header className="w-full bg-white border-b">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
