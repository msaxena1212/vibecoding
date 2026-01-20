import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function Games() {
  const [games, setGames] = useState([
    {
      id: 1,
      title: "Shinchan's Puzzle Mayhem",
      description: "Help Shinchan solve puzzles and cause hilarious chaos!",
      image: "public/assets/shinchan_episode1.png",
      link: "#",
    },
    {
      id: 2,
      title: "Doraemon's Gadget Adventure",
      description: "Explore Doraemon's gadgets and embark on exciting adventures.",
      image: "public/assets/doraemon_episode1.png",
      link: "#",
    },
    {
      id: 3,
      title: "Crossover Challenge",
      description: "Test your knowledge of both Shinchan and Doraemon in this ultimate crossover quiz!",
      image: "public/assets/shinchan.png",
      link: "#",
    },
  ]);

  useEffect(() => {
    // Simulate fetching games from an API
    // Replace with actual API call later
    const fetchGames = async () => {
      try {
        // const response = await fetch('/api/games');
        // const data = await response.json();
        // setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
        // Fallback to mock data
        setGames([
          {
            id: 1,
            title: "Shinchan's Puzzle Mayhem",
            description: "Help Shinchan solve puzzles and cause hilarious chaos!",
            image: "public/assets/shinchan_episode1.png",
            link: "#",
          },
          {
            id: 2,
            title: "Doraemon's Gadget Adventure",
            description: "Explore Doraemon's gadgets and embark on exciting adventures.",
            image: "public/assets/doraemon_episode1.png",
            link: "#",
          },
          {
            id: 3,
            title: "Crossover Challenge",
            description: "Test your knowledge of both Shinchan and Doraemon in this ultimate crossover quiz!",
            image: "public/assets/shinchan.png",
            link: "#",
          },
        ]);
      }
    };

    fetchGames();
  }, []);

  return (
    <motion.div
      className="container mx-auto py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-4 text-center">
        Test Your Knowledge and Unleash the Fun!
      </h1>
      <p className="text-lg text-center mb-8">
        Challenge yourself with quizzes, interactive games, and puzzles inspired
        by Shinchan and Doraemon.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <motion.div
            key={game.id}
            className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform duration-200"
            whileHover={{ y: -5 }}
          >
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{game.title}</h2>
              <p className="text-gray-300 mb-4">{game.description}</p>
              <Link
                to={game.link}
                className="inline-block bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 active:scale-95 transition-transform duration-200"
              >
                Play Now
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}