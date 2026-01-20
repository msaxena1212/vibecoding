import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white/10 backdrop-blur-lg fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600">
          Zoo Adventures
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/animals" className="text-gray-700 hover:text-gray-900">
            Animals
          </Link>
          <Link to="/events" className="text-gray-700 hover:text-gray-900">
            Events
          </Link>
          <Link to="/conservation" className="text-gray-700 hover:text-gray-900">
            Conservation
          </Link>
          <Link to="/visit" className="text-gray-700 hover:text-gray-900">
            Visit
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-gray-900">
            About
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-gray-900">
            Contact
          </Link>
        </nav>
      </div>

      {/* Mobile Menu (Framer Motion) */}
      <motion.div
        className={clsx(
          'md:hidden fixed top-0 left-0 h-full w-full bg-white/20 backdrop-blur-lg z-40 flex flex-col items-center justify-center space-y-6',
          { hidden: !isMenuOpen }
        )}
        initial={{ opacity: 0, x: '-100%' }}
        animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? '0%' : '-100%' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <X size={24} />
        </button>

        <nav className="flex flex-col items-center space-y-4">
          <Link to="/animals" className="text-gray-700 hover:text-gray-900 text-lg" onClick={toggleMenu}>
            Animals
          </Link>
          <Link to="/events" className="text-gray-700 hover:text-gray-900 text-lg" onClick={toggleMenu}>
            Events
          </Link>
          <Link to="/conservation" className="text-gray-700 hover:text-gray-900 text-lg" onClick={toggleMenu}>
            Conservation
          </Link>
          <Link to="/visit" className="text-gray-700 hover:text-gray-900 text-lg" onClick={toggleMenu}>
            Visit
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-gray-900 text-lg" onClick={toggleMenu}>
            About
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-gray-900 text-lg" onClick={toggleMenu}>
            Contact
          </Link>
        </nav>
      </motion.div>
    </header>
  );
}