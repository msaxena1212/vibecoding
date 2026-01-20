import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.div
      className="container mx-auto py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">
          Our Story
        </h1>
        <p className="text-gray-700 text-lg">
          Welcome to Indian Street Flavors! We're passionate about bringing the
          authentic tastes of India to your neighborhood. Our journey began with a
          simple idea: to share the vibrant and diverse cuisine of India in a
          convenient and affordable way.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">
          Our Mission
        </h2>
        <p className="text-gray-700 text-lg">
          Our mission is to provide a delicious and authentic Indian street food
          experience using fresh, high-quality ingredients. We're committed to
          offering a menu that caters to a variety of tastes and dietary
          preferences, including vegetarian, vegan, and gluten-free options. We
          believe that everyone should have access to flavorful and affordable food.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">
          Our Food Cart
        </h2>
        <p className="text-gray-700 text-lg">
          Our food cart is more than just a place to grab a quick bite; it's a
          community hub where people can come together to enjoy the flavors of India.
          We take pride in our friendly service and our commitment to creating a
          welcoming atmosphere for all.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">
          Contact Us
        </h2>
        <p className="text-gray-700 text-lg">
          Have questions or comments? We'd love to hear from you! Contact us through
          our website or visit us at our food cart location.
        </p>
      </section>
    </motion.div>
  );
}