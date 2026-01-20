import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// Define page components
function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12"
    >
      <h1 className="text-3xl font-bold mb-4">Home</h1>
      <p>Welcome to our Indian Food Cart!</p>
      <Link to="/menu" className="text-blue-500 hover:underline">View Menu</Link>
    </motion.div>
  );
}

function MenuPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12"
    >
      <h1 className="text-3xl font-bold mb-4">Menu</h1>
      <p>Check out our delicious Indian dishes!</p>
      <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
    </motion.div>
  );
}

function Order() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12"
    >
      <h1 className="text-3xl font-bold mb-4">Order</h1>
      <p>Place your order here.</p>
      <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
    </motion.div>
  );
}

function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12"
    >
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p>Learn more about our food cart.</p>
      <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
    </motion.div>
  );
}

function Contact() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12"
    >
      <h1 className="text-3xl font-bold mb-4">Contact</h1>
      <p>Contact us for inquiries.</p>
      <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
    </motion.div>
  );
}

// Layout Component
function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-500 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Indian Food Cart
          </Link>
          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {/* Navigation Links */}
          <nav className={`md:flex space-x-6 ${isMenuOpen ? 'flex flex-col absolute top-full left-0 w-full bg-orange-500 p-4' : 'hidden'}`}>
            <Link to="/" className="hover:text-orange-200">Home</Link>
            <Link to="/menu" className="hover:text-orange-200">Menu</Link>
            <Link to="/order" className="hover:text-orange-200">Order</Link>
            <Link to="/about" className="hover:text-orange-200">About</Link>
            <Link to="/contact" className="hover:text-orange-200">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 px-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Indian Food Cart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


// App Component
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order" element={<Order />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}