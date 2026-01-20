import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero.jsx';
import MenuItem from '../components/MenuItem.jsx';
import { useEffect, useState } from 'react';
import { getMenuItems } from '../services/api.js';

export default function Home() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        // Mock data fallback
        setMenuItems([
          {
            "id": "1",
            "name": "Chicken Tikka Masala Roll",
            "description": "Tender chicken tikka masala wrapped in a warm naan bread with fresh cilantro and mint chutney.",
            "price": 8.99,
            "category": "Rolls",
            "image_url": "https://example.com/tikka_roll.jpg",
            "ingredients": [
              "Chicken",
              "Yogurt",
              "Tomato",
              "Ginger",
              "Garlic",
              "Spices",
              "Naan",
              "Cilantro",
              "Mint",
              "Chutney"
            ],
            "allergens": [
              "Dairy",
              "Gluten"
            ],
            "is_vegetarian": false
          },
          {
            "id": "2",
            "name": "Vegetable Samosa (2 pcs)",
            "description": "Crispy fried pastry filled with spiced potatoes and peas. Served with tamarind chutney.",
            "price": 5.99,
            "category": "Appetizers",
            "image_url": "https://example.com/samosa.jpg",
            "ingredients": [
              "Potatoes",
              "Peas",
              "Spices",
              "Flour",
              "Oil",
              "Tamarind",
              "Sugar"
            ],
            "allergens": [
              "Gluten"
            ],
            "is_vegetarian": true
          },
          {
            "id": "3",
            "name": "Chole Bhature",
            "description": "A classic North Indian dish of spicy chickpeas served with fried bread (bhature).",
            "price": 9.99,
            "category": "Main Courses",
            "image_url": "https://example.com/chole_bhature.jpg",
            "ingredients": [
              "Chickpeas",
              "Onions",
              "Tomatoes",
              "Spices",
              "Flour",
              "Oil"
            ],
            "allergens": [
              "Gluten"
            ],
            "is_vegetarian": true
          },
          {
            "id": "4",
            "name": "Mango Lassi",
            "description": "A refreshing yogurt-based drink with mango pulp.",
            "price": 4.99,
            "category": "Drinks",
            "image_url": "https://example.com/mango_lassi.jpg",
            "ingredients": [
              "Mango",
              "Yogurt",
              "Sugar",
              "Cardamom"
            ],
            "allergens": [
              "Dairy"
            ],
            "is_vegetarian": true
          }
        ]);
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gray-50"
    >
      {/* Hero Section */}
      <Hero
        headline="Spice Up Your Day with Authentic Indian Flavors!"
        subheadline="Freshly prepared, delicious Indian street food. Order online for quick pickup or find our cart nearby!"
        primaryCTA="Order Online Now!"
        secondaryCTA="Find Our Location"
      />

      {/* Featured Menu Items */}
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Explore Our Delicious Menu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image_url}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Your Authentic Indian Food Cart Experience
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to [Cart Name]! We bring the vibrant tastes of India to
            your neighborhood with our authentic and freshly prepared dishes.
            Our menu features a diverse range of flavorful options, from classic
            favorites like Chicken Tikka Masala Rolls and Vegetable Samosas to
            regional specialties you won't find anywhere else. We're committed
            to using high-quality ingredients and traditional recipes to deliver
            an unforgettable culinary experience.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mt-4">
            At [Cart Name], we understand your need for quick, convenient, and
            affordable lunch options. That's why we offer easy online ordering
            for pickup, ensuring you can enjoy your favorite Indian dishes
            without the wait. We also prioritize hygiene and transparency,
            providing clear allergen information and maintaining the highest
            standards of cleanliness. Join us and discover the true taste of
            India, one delicious bite at a time!
          </p>
        </div>
      </section>

      {/* Online Ordering Section */}
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Order Online for Quick Pickup
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Skip the line and enjoy your favorite Indian dishes with our easy
            online ordering system! Simply browse our menu, add your selections
            to your cart, and choose a pickup time that works for you. We'll
            have your order ready and waiting when you arrive.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mt-4">
            Our online ordering platform is designed for convenience and speed,
            ensuring a seamless experience from start to finish. We accept all
            major credit cards and offer secure payment processing for your
            peace of mind.
          </p>
          <div className="mt-6">
            <a
              href="/order"
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full block text-center"
            >
              Order Online Now!
            </a>
          </div>
        </div>
      </section>

      {/* Find Us Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Find Our Food Cart Location
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We're always on the move, bringing the taste of India to different
            locations throughout the city! Check our website or follow us on
            social media for our current location and hours of operation.
          </p>
          {/* Implement Google Maps API here to display the current location of the food cart in real-time. */}
          <div className="mt-6">
            <p className="text-center text-gray-700">
              (Map Placeholder - Google Maps API Integration Needed)
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}