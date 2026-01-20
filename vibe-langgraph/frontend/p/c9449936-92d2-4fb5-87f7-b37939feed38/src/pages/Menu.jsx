import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MenuItem from "../components/MenuItem.jsx";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const mockMenuData = {
    menu: [
      {
        id: "1",
        name: "Chicken Tikka Masala Roll",
        description:
          "Tender chicken tikka masala wrapped in a warm naan bread with fresh cilantro and mint chutney.",
        price: 8.99,
        category: "Rolls",
        image_url: "/assets/chicken-tikka-masala.jpg",
        ingredients: [
          "Chicken",
          "Yogurt",
          "Tomato",
          "Ginger",
          "Garlic",
          "Spices",
          "Naan",
          "Cilantro",
          "Mint",
          "Chutney",
        ],
        allergens: ["Dairy", "Gluten"],
        is_vegetarian: false,
      },
      {
        id: "2",
        name: "Vegetable Samosa (2 pcs)",
        description:
          "Crispy fried pastry filled with spiced potatoes and peas. Served with tamarind chutney.",
        price: 5.99,
        category: "Appetizers",
        image_url: "/assets/samosas.jpg",
        ingredients: ["Potatoes", "Peas", "Spices", "Flour", "Oil", "Tamarind", "Sugar"],
        allergens: ["Gluten"],
        is_vegetarian: true,
      },
      {
        id: "3",
        name: "Chole Bhature",
        description:
          "A classic North Indian dish of spicy chickpeas served with fried bread (bhature).",
        price: 9.99,
        category: "Main Courses",
        image_url: "https://example.com/chole_bhature.jpg",
        ingredients: ["Chickpeas", "Onions", "Tomatoes", "Spices", "Flour", "Oil"],
        allergens: ["Gluten"],
        is_vegetarian: true,
      },
      {
        id: "4",
        name: "Mango Lassi",
        description: "A refreshing yogurt-based drink with mango pulp.",
        price: 4.99,
        category: "Drinks",
        image_url: "https://example.com/mango_lassi.jpg",
        ingredients: ["Mango", "Yogurt", "Sugar", "Cardamom"],
        allergens: ["Dairy"],
        is_vegetarian: true,
      },
    ],
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // const response = await fetch('/api/menu'); // Replace with your actual API endpoint
        // const data = await response.json();
        // setMenuItems(data.menu);

        //Using Mock Data
        setMenuItems(mockMenuData.menu);
      } catch (error) {
        console.error("Error fetching menu:", error);
        // Fallback to mock data if API fails
        setMenuItems(mockMenuData.menu);
      }
    };

    fetchMenu();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="container mx-auto py-12 px-4"
    >
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center mb-6 text-gray-700 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-orange-600">Our Menu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
}