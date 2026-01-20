import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export default function AnimalCard({ animal }) {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden shadow-md hover:scale-105 active:scale-95 transition-transform duration-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <img
        src={animal.image_url}
        alt={animal.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white">{animal.name}</h3>
        <p className="text-gray-300 text-sm mb-2">{animal.species}</p>
        <p className="text-gray-400 text-base">{animal.description}</p>
        <Link to={`/animals/${animal.id}`} className="inline-block mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Learn More
        </Link>
      </div>
    </motion.div>
  );
}