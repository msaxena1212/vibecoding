import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './pages/Home.jsx';
import Episodes from './pages/Episodes.jsx';
import Characters from './pages/Characters.jsx';
import Games from './pages/Games.jsx';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header
      className="bg-white/10 backdrop-blur-lg py-4 px-6 fixed top-0 left-0 right-0 z-50"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-yellow-400">
          Shinchan & Doraemon
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-300 hover:text-white focus:outline-none"
        >
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>

        {/* Navigation Links */}
        <nav className={`md:flex space-x-6 ${isMenuOpen ? 'flex flex-col absolute top-full left-0 w-full bg-white/10 backdrop-blur-lg p-4' : 'hidden'} md:relative`}>
          <Link to="/about" className="hover:text-yellow-300">About</Link>
          <Link to="/episodes" className="hover:text-yellow-300">Episodes</Link>
          <Link to="/characters" className="hover:text-yellow-300">Characters</Link>
          <Link to="/games" className="hover:text-yellow-300">Games</Link>
          <Link to="/fanzone" className="hover:text-yellow-300">Fan Zone</Link>
        </nav>
      </div>
    </motion.header>
  );
}

function Footer() {
  return (
    <motion.footer
      className="bg-white/10 backdrop-blur-lg py-4 px-6 text-center text-gray-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <p>&copy; {new Date().getFullYear()} Shinchan & Doraemon Fan Site</p>
    </motion.footer>
  );
}

function About() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on component mount
  }, []);
  return (
    <iframe src="/about.html" title="About" width="100%" height="600px" />
  );
}

function FanZone() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on component mount
  }, []);
  return (
    <iframe src="/fanzone.html" title="Fan Zone" width="100%" height="600px" />
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-800 text-white">
        <Header />
        <main className="container mx-auto py-20 px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/episodes" element={<Episodes />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/games" element={<Games />} />
            <Route path="/fanzone" element={<FanZone />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}