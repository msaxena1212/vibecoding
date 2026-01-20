import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden shadow-lg bg-white/10 backdrop-blur-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-orange-400 opacity-20"></div>
      <div className="relative p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{event.event_name}</h3>
        <div className="flex items-center text-gray-300 text-sm mb-1">
          <Calendar className="mr-2 h-4 w-4" />
          {event.date}
        </div>
        <div className="flex items-center text-gray-300 text-sm mb-1">
          <Clock className="mr-2 h-4 w-4" />
          {event.time}
        </div>
        <div className="flex items-center text-gray-300 text-sm mb-3">
          <MapPin className="mr-2 h-4 w-4" />
          {event.location}
        </div>
        <p className="text-gray-200 leading-relaxed">{event.description}</p>
        <Link to={event.link} className="mt-4 inline-block">
          <motion.span className="text-green-400 hover:text-green-300 transition-colors duration-200">
            Learn More &rarr;
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}