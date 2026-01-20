import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function MenuItemCard({ item }) {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={item.image}
        alt={item.item}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex-grow">
        <h3 className="text-xl font-semibold mb-2 text-orange-600">{item.item}</h3>
        <p className="text-gray-700 text-sm flex-grow">{item.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-900 font-bold">${item.price.toFixed(2)}</span>
          <motion.button
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded flex items-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="mr-2" size={16} />
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}