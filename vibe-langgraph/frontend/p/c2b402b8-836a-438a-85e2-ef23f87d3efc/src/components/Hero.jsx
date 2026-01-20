import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <motion.div
      className="relative h-[80vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('/assets/lion.jpg')` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center text-white">
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          Roar into Adventure! Explore Wildlife Wonders.
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          Discover amazing animals, exciting events, and make unforgettable memories at [Zoo Name]!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Link to="/visit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4 inline-block hover:scale-105 active:scale-95 transition-transform duration-200">
            Buy Tickets Now!
          </Link>
          <Link to="/animals" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded inline-block hover:scale-105 active:scale-95 transition-transform duration-200">
            Explore Our Animals
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}