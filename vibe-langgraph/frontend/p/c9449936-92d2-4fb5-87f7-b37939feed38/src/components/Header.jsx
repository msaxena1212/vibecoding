import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white/10 backdrop-blur-lg text-white py-4 px-6 shadow-md"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold hover:text-orange-200 transition-colors duration-300">
          Indian Food Cart
        </Link>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <nav className={cn(
          "md:flex space-x-6 items-center",
          isMenuOpen ? "flex flex-col absolute top-full left-0 w-full bg-orange-500 p-4" : "hidden"
        )}>
          <Link to="/" className="hover:text-orange-200 transition-colors duration-300">
            Home
          </Link>
          <Link to="/menu" className="hover:text-orange-200 transition-colors duration-300">
            Menu
          </Link>
          <Link to="/order" className="hover:text-orange-200 transition-colors duration-300">
            Order
          </Link>
          <Link to="/about" className="hover:text-orange-200 transition-colors duration-300">
            About
          </Link>
          <Link to="/contact" className="hover:text-orange-200 transition-colors duration-300">
            Contact
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}