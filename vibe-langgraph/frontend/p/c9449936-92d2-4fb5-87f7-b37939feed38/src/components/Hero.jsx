import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-cover bg-center h-[80vh] flex items-center justify-center"
      style={{ backgroundImage: `url('/assets/chicken-tikka-masala.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 text-center text-white">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
        >
          Spice Up Your Day!
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl lg:text-2xl mb-8"
        >
          Authentic Indian Flavors Await
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/menu" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 inline-block mx-2">
            View Our Menu
          </Link>
          <Link to="/order" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 inline-block mx-2">
            Order Now
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}