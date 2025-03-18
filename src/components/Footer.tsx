
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#221F26] text-white mt-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 py-4 md:py-8">
          <div>
            <h3 className="font-bold mb-2 text-white text-base md:text-lg">About Us</h3>
            <ul className="space-y-1 md:space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-primary transition-colors">About NimbyGram</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-primary transition-colors">Press</Link></li>
              <li><Link to="/investors" className="hover:text-primary transition-colors">Investors</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2 text-white text-base md:text-lg">Legal</h3>
            <ul className="space-y-1 md:space-y-2 text-gray-400">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2 text-white text-base md:text-lg">Support</h3>
            <ul className="space-y-1 md:space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Centre</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2 text-white text-base md:text-lg">Connect</h3>
            <p className="text-gray-400">Email: marco@nimbygram.com</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 py-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} NimbyGram Ltd. All rights reserved.</p>
          <p className="mt-1">NimbyGram Ltd is registered in England and Wales.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
