import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header
      className="bg-orange-600 text-white py-4 shadow-md sticky top-0 z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold hover:text-orange-200">
          Indian Street Flavors
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-orange-200">
            Home
          </Link>
          <Link to="/menu" className="hover:text-orange-200">
            Menu
          </Link>
          <Link to="/location" className="hover:text-orange-200">
            Location
          </Link>
          <Link to="/catering" className="hover:text-orange-200">
            Catering
          </Link>
        </nav>
      </div>

      {/* Mobile Menu (Conditional Rendering) */}
      {isMobileMenuOpen && (
        <motion.div
          className={clsx(
            "md:hidden absolute top-full left-0 w-full py-4 px-6 flex flex-col items-center",
            "bg-white/10 backdrop-blur-lg"
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" className="block py-2 hover:text-orange-200" onClick={toggleMobileMenu}>
            Home
          </Link>
          <Link to="/menu" className="block py-2 hover:text-orange-200" onClick={toggleMobileMenu}>
            Menu
          </Link>
          <Link to="/location" className="block py-2 hover:text-orange-200" onClick={toggleMobileMenu}>
            Location
          </Link>
          <Link to="/catering" className="block py-2 hover:text-orange-200" onClick={toggleMobileMenu}>
            Catering
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}