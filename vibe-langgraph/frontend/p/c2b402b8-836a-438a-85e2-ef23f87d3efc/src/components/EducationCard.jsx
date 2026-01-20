import { motion } from 'framer-motion';
import { Book } from 'lucide-react';
import clsx from 'clsx';

export default function EducationCard({ title, description, resourceType }) {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 border border-white/20"
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Book className="text-green-400" size={20} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <span className={clsx(
          "text-xs font-medium rounded-full px-2 py-1",
          {
            "bg-blue-100 text-blue-800": resourceType === 'Article',
            "bg-purple-100 text-purple-800": resourceType === 'Video',
            "bg-green-100 text-green-800": resourceType === 'Guide',
          }
        )}>
          {resourceType}
        </span>
        <motion.a
          href="#"
          className="text-green-400 hover:text-green-300 active:text-green-500 transition-colors duration-200 text-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Learn More
        </motion.a>
      </div>
    </motion.div>
  );
}