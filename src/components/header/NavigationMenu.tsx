import { Link } from "react-router-dom";

export const NavigationMenu = () => {
  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link to="/resident-services" className="text-gray-600 hover:text-primary">
        Resident Services
      </Link>
      <Link to="/developer-services" className="text-gray-600 hover:text-primary">
        Developer Services
      </Link>
      <Link to="/council-services" className="text-gray-600 hover:text-primary">
        Council Services
      </Link>
      <Link to="/about" className="text-gray-600 hover:text-primary">
        About
      </Link>
      <Link to="/contact" className="text-gray-600 hover:text-primary">
        Contact
      </Link>
    </nav>
  );
};