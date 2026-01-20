import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      className="bg-gray-800 text-white py-4 mt-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto text-center">
        <p>&copy; 2024 Indian Street Flavors. All rights reserved.</p>
        <div className="flex justify-center mt-2 space-x-4">
          <a href="#" className="hover:text-orange-500">
            {/* Replace with actual social media links and icons */}
            Facebook
          </a>
          <a href="#" className="hover:text-orange-500">
            Twitter
          </a>
          <a href="#" className="hover:text-orange-500">
            Instagram
          </a>
        </div>
      </div>
    </motion.footer>
  );
}