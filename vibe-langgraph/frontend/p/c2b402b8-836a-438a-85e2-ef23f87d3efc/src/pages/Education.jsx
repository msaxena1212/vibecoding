import { useState, useEffect } from "react";
import EducationCard from "../components/EducationCard";
import { motion } from "framer-motion";

export default function Education() {
  const [resources, setResources] = useState([
    {
      id: 1,
      title: "Online Course: Introduction to Wildlife Conservation",
      type: "Online Course",
      description:
        "Learn the fundamentals of wildlife conservation and how you can make a difference.",
      link: "#",
    },
    {
      id: 2,
      title: "Interactive Game: Animal Adventures",
      type: "Game",
      description:
        "Embark on a virtual adventure and discover fascinating facts about animals.",
      link: "#",
    },
    {
      id: 3,
      title: "Educational Video: The Secret Life of Elephants",
      type: "Video",
      description: "Explore the social behavior and intelligence of elephants.",
      link: "#",
    },
    {
      id: 4,
      title: "Printable Activity: Animal Tracks Matching Game",
      type: "Printable",
      description:
        "Test your knowledge of animal tracks with this fun and educational activity.",
      link: "#",
    },
    {
      id: 5,
      title: "Virtual Tour: Amazon Rainforest",
      type: "Virtual Tour",
      description: "Explore the Amazon Rainforest and its incredible biodiversity.",
      link: "#",
    },
    {
      id: 6,
      title: "Book: The Atlas of Endangered Animals",
      type: "Book",
      description: "Discover the world's most endangered animals and their stories.",
      link: "#",
    },
  ]);

  // Group resources by type
  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.type]) {
      acc[resource.type] = [];
    }
    acc[resource.type].push(resource);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-8"
    >
      <h1 className="text-3xl font-bold mb-4 text-center">
        Educational Resources
      </h1>
      {Object.entries(groupedResources).map(([type, resources]) => (
        <div key={type} className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">{type}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <EducationCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}