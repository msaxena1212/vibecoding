import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllCharacters } from './services/api';

export function Home() {
  const [characters, setCharacters] = useState([]);
  const heroHeadline = "Step Into a World of Laughter and Gadgets!";
  const heroSubheadline = "Relive your childhood with Shinchan's hilarious adventures and Doraemon's magical inventions. Explore episode guides, character profiles, and fan-made content in one delightful place.";

  useEffect(() => {
    async function loadCharacters() {
      try {
        const fetchedCharacters = await getAllCharacters();
        setCharacters(fetchedCharacters);
      } catch (error) {
        console.error("Error fetching characters:", error);
        // Fallback to mock data if API fails
        setCharacters([
          { id: 1, name: "Shinchan", imageUrl: "assets/shinchan.png" },
          { id: 2, name: "Doraemon", imageUrl: "assets/doraemon.png" }
        ]);
      }
    }
    loadCharacters();
  }, []);

  return (
    <motion.div
      className="container mx-auto py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
          {heroHeadline}
        </h1>
        <p className="text-lg text-gray-300">{heroSubheadline}</p>
        <motion.div className="mt-6 flex space-x-4">
          <Link to="/episodes" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
            Explore Episodes
          </Link>
          <Link to="/characters" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
            Meet Characters
          </Link>
        </motion.div>
      </section>

      {/* Featured Content Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Character Spotlights */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:scale-105 active:scale-95"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold text-yellow-300 mb-2">Character Spotlights</h2>
          <p className="text-gray-300">Get to know Shinchan, Doraemon, and the whole gang!</p>
          <div className="flex justify-around mt-4">
            {characters.map(character => (
              <div key={character.id} className="text-center">
                <img src={character.imageUrl} alt={character.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-2" />
                <p className="text-sm text-gray-200">{character.name}</p>
              </div>
            ))}
          </div>
          <Link to="/characters" className="block mt-4 text-blue-400 hover:text-blue-500 text-center">
            View All Characters
          </Link>
        </motion.div>

        {/* Episode Highlights */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:scale-105 active:scale-95"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold text-yellow-300 mb-2">Episode Highlights</h2>
          <p className="text-gray-300">Catch the funniest and most heartwarming moments.</p>
          <div className="flex justify-around mt-4">
            <div>
              <img src="assets/shinchan_episode1.png" alt="Shinchan Episode 1" className="w-24 h-24 rounded-full object-cover mx-auto mb-2" />
              <p className="text-sm text-gray-200">Shinchan Ep 1</p>
            </div>
            <div>
              <img src="assets/doraemon_episode1.png" alt="Doraemon Episode 1" className="w-24 h-24 rounded-full object-cover mx-auto mb-2" />
              <p className="text-sm text-gray-200">Doraemon Ep 1</p>
            </div>
          </div>
          <Link to="/episodes" className="block mt-4 text-blue-400 hover:text-blue-500 text-center">
            Explore All Episodes
          </Link>
        </motion.div>

        {/* Fan Zone */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:scale-105 active:scale-95"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold text-yellow-300 mb-2">Fan Zone</h2>
          <p className="text-gray-300">Share your love for Shinchan & Doraemon!</p>
          <p className="mt-4 text-gray-200">Connect with other fans, share your artwork, and participate in polls.</p>
          <Link to="/fanzone" className="block mt-4 text-blue-400 hover:text-blue-500 text-center">
            Join the Fan Frenzy
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}

export default Home;