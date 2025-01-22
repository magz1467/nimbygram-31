import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#221F26] text-white mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">About Us</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-primary">About NimbyGram</Link></li>
              <li><Link to="/careers" className="hover:text-primary">Careers</Link></li>
              <li><Link to="/press" className="hover:text-primary">Press</Link></li>
              <li><Link to="/investors" className="hover:text-primary">Investors</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="hover:text-primary">Accessibility</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-primary">Help Centre</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <p className="text-sm mb-4">Email: marco@nimbygram.com</p>
            <p className="text-sm h-[40px]"></p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Nimbygram Ltd. All rights reserved.</p>
          <p className="mt-2">Nimbygram Ltd is registered in England and Wales.</p>
          <p className="mt-2">85 Great Portland Street, London W1W 7LT</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;