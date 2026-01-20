import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 text-white py-8 px-6"
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p className="text-gray-300">
            Address: 123 Curry Street, Anytown, USA
          </p>
          <p className="text-gray-300">
            Email: info@indianfoodcart.com
          </p>
          <p className="text-gray-300">
            Phone: (555) 123-4567
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="text-gray-300 hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className="text-gray-300 hover:text-white">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/order" className="text-gray-300 hover:text-white">
                Order Online
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-gray-300 hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-300 hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-white">
              <Instagram size={24} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              <Facebook size={24} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              <Twitter size={24} />
            </a>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-lg font-bold mb-4">Subscribe to Our Newsletter</h3>
          <p className="text-gray-300 mb-4">
            Get the latest updates on our menu, specials, and location.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-gray-700 text-white px-4 py-2 rounded-l-md focus:outline-none"
            />
            <button className="bg-orange-500 text-white px-4 py-2 rounded-r-md hover:bg-orange-600">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto text-center mt-8">
        <p className="text-gray-400">
          &copy; 2024 Indian Food Cart. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}