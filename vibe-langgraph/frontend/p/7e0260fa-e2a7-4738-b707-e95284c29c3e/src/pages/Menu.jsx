import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MenuItemCard from "../components/MenuItemCard";
import { getMenu } from "../services/api";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getMenu();
        setMenuItems(data.menu);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Error fetching menu:", err);
      }
    };

    fetchMenu();
  }, []);

  if (loading) {
    return (
      <motion.div
        className="container mx-auto py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-center text-gray-600">Loading menu...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="container mx-auto py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-center text-red-600">
          Error loading menu. Please try again later.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-orange-600 mb-6 text-center">
        Our Delicious Menu
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <MenuItemCard key={index} item={item} />
        ))}
      </div>
    </motion.div>
  );
}