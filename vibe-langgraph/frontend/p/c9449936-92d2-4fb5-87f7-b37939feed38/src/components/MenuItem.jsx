import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function MenuItem({ item }) {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <img className="w-full h-48 object-cover" src={item.image_url} alt={item.name} />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-orange-500 font-bold">${item.price}</span>
          <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}