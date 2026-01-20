import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  const aboutUsContent = {
    title: "Your Authentic Indian Food Cart Experience",
    body: "Welcome to [Cart Name]! We bring the vibrant tastes of India to your neighborhood with our authentic and freshly prepared dishes. Our menu features a diverse range of flavorful options, from classic favorites like Chicken Tikka Masala Rolls and Vegetable Samosas to regional specialties you won't find anywhere else. We're committed to using high-quality ingredients and traditional recipes to deliver an unforgettable culinary experience.\n\nAt [Cart Name], we understand your need for quick, convenient, and affordable lunch options. That's why we offer easy online ordering for pickup, ensuring you can enjoy your favorite Indian dishes without the wait. We also prioritize hygiene and transparency, providing clear allergen information and maintaining the highest standards of cleanliness. Join us and discover the true taste of India, one delicious bite at a time!"
  };

  const menuHighlightsContent = {
    title: "Explore Our Delicious Menu",
    body: "Our menu is carefully crafted to offer a wide variety of authentic Indian flavors, catering to diverse tastes and dietary preferences. Here are a few of our most popular dishes:\n\n**Chicken Tikka Masala Roll:** Tender chicken tikka masala wrapped in warm naan bread with fresh cilantro and mint chutney. A flavorful and satisfying meal on the go.\n\n**Vegetable Samosas:** Crispy fried pastries filled with spiced potatoes and peas. Served with tamarind chutney for a sweet and tangy kick. Perfect as an appetizer or snack.\n\n**Chole Bhature:** A classic North Indian dish of spicy chickpeas served with fluffy fried bread (bhature). A hearty and flavorful vegetarian option.\n\n**Mango Lassi:** A refreshing yogurt-based drink with mango pulp. The perfect complement to any meal, offering a sweet and cooling taste of India.\n\nWe also offer a variety of vegetarian, vegan, and gluten-free options to accommodate all dietary needs. Check out our full menu online for more details!"
  };

  const onlineOrderingContent = {
    title: "Order Online for Quick Pickup",
    body: "Skip the line and enjoy your favorite Indian dishes with our easy online ordering system! Simply browse our menu, add your selections to your cart, and choose a pickup time that works for you. We'll have your order ready and waiting when you arrive.\n\nOur online ordering platform is designed for convenience and speed, ensuring a seamless experience from start to finish. We accept all major credit cards and offer secure payment processing for your peace of mind.\n\n**How to Order Online:**\n\n1.  Visit our website and click on the 'Order Online' button.\n2.  Browse our menu and add your desired items to your cart.\n3.  Select your preferred pickup time.\n4.  Review your order and proceed to checkout.\n5.  Enter your payment information and confirm your order.\n\nWe'll send you a confirmation email with your order details and pickup instructions. Enjoy your delicious Indian meal!"
  };

  const findUsContent = {
    title: "Find Our Food Cart Location",
    body: "We're always on the move, bringing the taste of India to different locations throughout the city! Check our website or follow us on social media for our current location and hours of operation.\n\n[Implement Google Maps API here to display the current location of the food cart in real-time.]\n\nWe also offer catering services for corporate events, parties, and other special occasions. Contact us to learn more about our catering options and customize a menu to suit your needs."
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-12 px-4 md:px-8"
    >
      <section id="about_us" className="mb-8">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">{aboutUsContent.title}</h2>
        <p className="text-gray-700 leading-relaxed">{aboutUsContent.body}</p>
      </section>

      <section id="menu_highlights" className="mb-8">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">{menuHighlightsContent.title}</h2>
        <p className="text-gray-700 leading-relaxed">{menuHighlightsContent.body}</p>
      </section>

      <section id="online_ordering" className="mb-8">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">{onlineOrderingContent.title}</h2>
        <p className="text-gray-700 leading-relaxed">{onlineOrderingContent.body}</p>
      </section>

      <section id="find_us">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">{findUsContent.title}</h2>
        <p className="text-gray-700 leading-relaxed">{findUsContent.body}</p>
      </section>
    </motion.div>
  );
}