import { useState, useEffect } from "react";
import AnimalCard from "../components/AnimalCard";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { clsx } from "clsx";
import api from "../services/api";

const mockAnimals = [
  {
    id: "1",
    name: "African Elephant",
    scientificName: "Loxodonta africana",
    image: "assets/elephant.png",
    description:
      "The African elephant is the largest land animal on Earth. They are known for their long trunks, large ears, and intelligence.",
    habitat: "Savannas, grasslands, forests, and deserts of Africa.",
    diet: "Herbivorous; eats grasses, leaves, bark, and fruit.",
    conservationStatus: "Vulnerable",
    funFact:
      "Elephants can communicate with each other using infrasound, which humans cannot hear.",
  },
  {
    id: "2",
    name: "Lion",
    scientificName: "Panthera leo",
    image: "assets/lion.png",
    description:
      "The lion is a large cat known for its majestic mane (in males) and powerful roar.",
    habitat: "Savannas and grasslands of Africa.",
    diet: "Carnivorous; preys on large mammals.",
    conservationStatus: "Vulnerable",
    funFact: "Lions are the only cats that live in social groups called prides.",
  },
  {
    id: "3",
    name: "Giraffe",
    scientificName: "Giraffa camelopardalis",
    image: "https://placehold.co/300x200",
    description:
      "Giraffes are the tallest mammals on Earth, known for their long necks and distinctive spotted patterns.",
    habitat: "Savannas and woodlands of Africa.",
    diet: "Herbivorous; feeds on leaves and shoots from tall trees.",
    conservationStatus: "Vulnerable",
    funFact:
      "A giraffe's neck is about 6 feet long and weighs about 600 pounds.",
  },
];

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAnimals, setFilteredAnimals] = useState([]);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const data = await api.getAnimals();
        setAnimals(data);
      } catch (error) {
        console.error("Error fetching animals:", error);
        // Fallback to mock data
        setAnimals(mockAnimals);
      }
    };

    fetchAnimals();
  }, []);

  useEffect(() => {
    const results = animals.filter((animal) =>
      animal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnimals(results);
  }, [searchTerm, animals]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-8"
    >
      <h1 className="text-3xl font-bold mb-4 text-center">
        Explore Our Amazing Animals
      </h1>

      {/* Search Bar */}
      <div className="flex items-center mb-6 max-w-md mx-auto">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search animals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Animal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => (
          <AnimalCard
            key={animal.id}
            name={animal.name}
            scientificName={animal.scientificName}
            image={animal.image}
            description={animal.description}
            habitat={animal.habitat}
            diet={animal.diet}
            conservationStatus={animal.conservationStatus}
            funFact={animal.funFact}
            id={animal.id}
          />
        ))}
      </div>
    </motion.div>
  );
}