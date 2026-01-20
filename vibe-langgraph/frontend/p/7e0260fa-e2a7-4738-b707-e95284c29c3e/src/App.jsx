import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import MenuPage from './pages/MenuPage';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header
      className="bg-orange-600 text-white py-4 shadow-md sticky top-0 z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold hover:text-orange-200">
          Indian Street Flavors
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-orange-200">
            Home
          </Link>
          <Link to="/menu" className="hover:text-orange-200">
            Menu
          </Link>
          <Link to="/location" className="hover:text-orange-200">
            Location
          </Link>
          <Link to="/catering" className="hover:text-orange-200">
            Catering
          </Link>
        </nav>
      </div>

      {/* Mobile Menu (Conditional Rendering) */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden absolute top-full left-0 w-full bg-orange-600/90 backdrop-blur-lg py-4 px-6 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" className="block py-2 hover:text-orange-200" onClick={toggleMobileMenu}>
            Home
          </Link>
          <Link to="/menu" className="block py-2 hover:text-orange-200" onClick={toggleMobileMenu}>
            Menu
          </Link>
          <Link to="/location" className="block py-2 hover:text-orange-200" onClick={toggleMobileMenu}>
            Location
          </Link>
          <Link to="/catering" className="block py-2 hover:text-orange-200" onClick={toggleMobileMenu}>
            Catering
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}

function Footer() {
  return (
    <motion.footer
      className="bg-gray-800 text-white py-4 mt-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto text-center">
        <p>&copy; 2024 Indian Street Flavors. All rights reserved.</p>
      </div>
    </motion.footer>
  );
}


function HomePage() {
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
          Spice Up Your Day with Authentic Indian Flavors!
        </h1>
        <p className="text-gray-700 text-lg">
          Experience the vibrant tastes of India, freshly prepared and served fast.
          Order online for pickup or find our cart near you!
        </p>
        <div className="mt-6">
          <Link
            to="/menu"
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mr-4 inline-block"
          >
            Order Online Now!
          </Link>
          <Link
            to="/location"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block"
          >
            Find Our Location
          </Link>
        </div>
      </section>

      <section id="about_us" className="mb-8">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">
          Your Quick Escape to India
        </h2>
        <p className="text-gray-700 text-lg">
          We're not just a food cart; we're a culinary journey. Inspired by the
          bustling streets of India, we bring you authentic flavors made with fresh
          ingredients and time-honored recipes. From our signature Chicken Tikka
          Masala Roll to our crispy Vegetable Samosas, every bite is a celebration
          of Indian cuisine. We're committed to providing a delicious, affordable,
          and convenient experience that will transport your taste buds straight to
          the heart of India.
        </p>
      </section>

      <section id="menu_highlights" className="mb-8">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">
          Our Crowd-Pleasing Menu
        </h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <img
              src="/assets/food_cart.jpg"
              alt="Menu Highlights"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2 pl-4">
            <p className="text-gray-700 text-lg">
              Dive into our menu, crafted to deliver an authentic Indian street food
              experience.
            </p>
            <ul className="list-disc pl-5 mt-4">
              <li>
                <span className="font-semibold">Chicken Tikka Masala Roll:</span>{' '}
                Indulge in our best-selling roll featuring succulent grilled chicken
                tikka enveloped in a creamy tomato sauce, all wrapped in a soft, warm
                naan. It's the perfect grab-and-go delight for a quick and satisfying
                lunch. ($8.99)
              </li>
              <li>
                <span className="font-semibold">Vegetable Samosas (2):</span>{' '}
                Experience the crispy, golden goodness of our samosas, filled with a
                savory blend of spiced potatoes and peas. Served with a tangy mint
                chutney, these appetizers are a vegetarian's dream. ($5.99)
              </li>
              <li>
                <span className="font-semibold">Chole Bhature:</span> Savor the rich
                and spicy flavors of our Chole Bhature, a classic North Indian dish
                featuring a flavorful chickpea curry served with fluffy, fried bread
                (bhature). A hearty and authentic meal that will leave you wanting
                more. ($9.99)
              </li>
              <li>
                <span className="font-semibold">Mango Lassi:</span> Cool down with
                our refreshing Mango Lassi, a traditional yogurt-based drink blended
                with sweet mango pulp. The perfect complement to any meal, offering a
                sweet and creamy escape. ($4.99)
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="online_ordering" className="mb-8">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">
          Order Online & Skip the Line
        </h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <p className="text-gray-700 text-lg">
              Craving our delicious Indian street food? Order online for quick and easy
              pickup! Browse our full menu, customize your spice level, and pay
              securely through our website. Skip the wait and enjoy your favorite
              dishes fresh and ready when you arrive. We accept all major credit
              cards and mobile payment options.
            </p>
          </div>
          <div className="md:w-1/2 pl-4">
            <img
              src="/assets/chicken-tikka-masala.jpg"
              alt="Online Ordering"
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      <section id="find_us" className="mb-8">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">
          Find Our Cart
        </h2>
        <p className="text-gray-700 text-lg mb-4">
          We're always on the move, bringing the flavors of India to you! Check our
          website or follow us on social media for our current location and hours of
          operation. You can typically find us in high-traffic areas like downtown
          business districts, near universities, and at local events. Use the map
          below to see our real-time location and plan your visit!
        </p>
        <div className="w-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.791219846087!2d-122.41945!3d37.77492969999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809a99b99999%3A0x9999999999999999!2sSan+Francisco!5e0!3m2!1sen!2sus!4v1687357566840!5m2!1sen!2sus"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Food Cart Location"
          ></iframe>
        </div>
      </section>

      <section id="catering">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">
          Spice Up Your Events with Our Catering Services
        </h2>
        <p className="text-gray-700 text-lg">
          Bring the vibrant flavors of India to your next event! Whether it's a
          corporate lunch, a birthday party, or a special celebration, our catering
          services offer a delicious and authentic Indian experience. We offer
          customizable menus to suit your needs and budget, with options for
          vegetarian, vegan, and gluten-free diets. Contact us today to discuss
          your catering needs and let us create a memorable culinary experience for
          your guests.
        </p>
      </section>
    </motion.div>
  );
}


function LocationPage() {
  return (
    <motion.div
      className="container mx-auto py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Find Us</h1>
      <p className="text-gray-700 text-lg">
        We're always on the move, bringing the flavors of India to you! Check our
        website or follow us on social media for our current location and hours of
        operation.
      </p>
      <div className="w-full mt-4">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.791219846087!2d-122.41945!3d37.77492969999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809a99b99999%3A0x9999999999999999!2sSan+Francisco!5e0!3m2!1sen!2sus!4v1687357566840!5m2!1sen!2sus"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Food Cart Location"
        ></iframe>
      </div>
    </motion.div>
  );
}


function CateringPage() {
  return (
    <motion.div
      className="container mx-auto py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Catering Services</h1>
      <p className="text-gray-700 text-lg">
        Bring the vibrant flavors of India to your next event! Whether it's a
        corporate lunch, a birthday party, or a special celebration, our catering
        services offer a delicious and authentic Indian experience.
      </p>
    </motion.div>
  );
}


export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/location" element={<LocationPage />} />
            <Route path="/catering" element={<CateringPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}