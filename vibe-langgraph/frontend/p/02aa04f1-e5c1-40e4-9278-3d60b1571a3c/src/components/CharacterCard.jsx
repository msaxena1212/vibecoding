import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Avatar } from 'lucide-react';

export default function CharacterCard({ character }) {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-md hover:scale-105 active:scale-95 transition-transform duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          {character.imageUrl ? (
            <img src={character.imageUrl} alt={character.name} className="object-cover w-full h-full" />
          ) : (
            <Avatar className="w-full h-full" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{character.name}</h3>
          <p className="text-gray-300">{character.description}</p>
          <Link to={`/characters/${character.id}`} className="text-blue-400 hover:text-blue-300">
            Learn More
          </Link>
        </div>
      </div>
    </motion.div>
  );
}