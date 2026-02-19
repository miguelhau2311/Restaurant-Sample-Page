import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <p>Musterstrasse 123</p>
              <p>1234 Vienna</p>
              <a href="mailto:info@gourmethaven.com" className="hover:text-orange-500 transition-colors">
                info@gourmethaven.com
              </a>
              <Link to="/contact" className="block hover:text-orange-500 transition-colors">
                Get in touch
              </Link>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4">Opening Hours</h3>
            <div className="space-y-2">
              <p>Mon - Fri: 11:00 - 23:00</p>
              <p>Sat - Sun: 12:00 - 23:00</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links</h3>
            <div className="space-y-2">
              <Link to="/menu" className="block hover:text-orange-500 transition-colors">
                Menu
              </Link>
              <Link to="/reservations" className="block hover:text-orange-500 transition-colors">
                Reservations
              </Link>
              <Link to="/contact" className="block hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white font-semibold mb-4">Social Media</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="mailto:info@gourmethaven.com" className="hover:text-orange-500 transition-colors">
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Gourmet Haven. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/legal" className="hover:text-orange-500 transition-colors">
              Legal Notice
            </Link>
            <Link to="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-orange-500 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
