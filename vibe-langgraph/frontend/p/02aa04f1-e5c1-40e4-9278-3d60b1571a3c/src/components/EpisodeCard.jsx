import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import clsx from 'clsx';

export default function EpisodeCard({ episode, series }) {
  const { title, episodeNumber, description, imageUrl } = episode;

  const bentoStyle = clsx(
    'rounded-2xl overflow-hidden shadow-lg',
    'hover:scale-105 active:scale-95 transition-transform duration-200',
    'relative' // For absolute positioning of the overlay
  );

  const auroraStyle = `bg-gradient-to-br from-yellow-400 via-red-500 to-purple-500 absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10`;

  return (
    <motion.div className="group" layoutId={`episode-${episodeNumber}`}>
      <div className={bentoStyle}>
        <div className={auroraStyle} />
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover relative z-20"
        />
        <div className="p-4 relative z-20">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-200">{description}</p>
          <div className="flex items-center mt-2">
            <Star className="text-yellow-400 mr-1" size={16} />
            <span className="text-xs text-gray-300">Episode {episodeNumber}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}