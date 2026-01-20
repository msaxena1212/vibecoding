import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EpisodeCard } from "../components/EpisodeCard.jsx";
import { Input } from "lucide-react";

export default function Episodes() {
  const [episodes, setEpisodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const response = await fetch("/api/episodes");
        const data = await response.json();
        setEpisodes(data);
        setFilteredEpisodes(data);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        // Mock Data Fallback
        const mockEpisodes = [
          { id: 1, title: "Episode 1", series: "Shinchan", description: "Shinchan does something funny.", imageUrl: "/assets/shinchan_episode1.png" },
          { id: 2, title: "Episode 2", series: "Doraemon", description: "Doraemon helps Nobita with a gadget.", imageUrl: "/assets/doraemon_episode1.png" },
        ];
        setEpisodes(mockEpisodes);
        setFilteredEpisodes(mockEpisodes);
      }
    };

    fetchEpisodes();
  }, []);

  useEffect(() => {
    const results = episodes.filter((episode) =>
      episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.series.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEpisodes(results);
  }, [searchTerm, episodes]);

  return (
    <motion.div
      className="container mx-auto py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-4 text-center">
        Relive Classic Episodes
      </h1>

      <div className="mb-4 flex items-center">
        <Input size={20} className="mr-2" />
        <input
          type="text"
          placeholder="Search episodes..."
          className="bg-white/10 backdrop-blur-lg text-white rounded-md py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEpisodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>
    </motion.div>
  );
}