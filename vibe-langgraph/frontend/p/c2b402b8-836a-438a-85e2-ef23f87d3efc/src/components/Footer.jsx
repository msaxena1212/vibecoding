import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { clsx } from 'clsx';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com', // Replace with actual Facebook link
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com', // Replace with actual Instagram link
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com', // Replace with actual Twitter link
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://youtube.com', // Replace with actual YouTube link
    },
  ];

  return (
    <footer className="bg-green-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">Explore</h4>
            <ul>
              <li>
                <Link to="/" className="hover:text-green-300 block py-1">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/animals" className="hover:text-green-300 block py-1">
                  Animals
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-green-300 block py-1">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/conservation" className="hover:text-green-300 block py-1">
                  Conservation
                </Link>
              </li>
              <li>
                <Link to="/visit" className="hover:text-green-300 block py-1">
                  Visit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-green-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon size={24} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p>123 Zoo Lane</p>
            <p>City, State, Zip Code</p>
            <p>Email: info@examplezoo.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul>
              <li>
                <Link to="/about" className="hover:text-green-300 block py-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-300 block py-1">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-green-300 block py-1">
                  Donate
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-green-600 pt-4 text-center">
          <p>
            &copy; {currentYear} Example Zoo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}