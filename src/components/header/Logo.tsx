
import { Link } from "react-router-dom";
import "../../styles/components/logo.css";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="text-2xl font-bold font-playfair logo">
        nimbygram
      </span>
    </Link>
  );
};
