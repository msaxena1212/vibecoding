import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const mockConservationData = {
  title: "Conservation in Action: Protecting Wildlife for Future Generations",
  body: "[Zoo Name] is deeply committed to conservation and education. We actively participate in research projects, support wildlife protection programs, and educate visitors about the importance of biodiversity. Discover how you can contribute to our efforts and help us make a difference in the lives of animals worldwide. Learn about our breeding programs and our global partnerships.",
  conservation_highlight: {
    title: "Saving the [Endangered Species]",
    description: "Learn about our groundbreaking work to protect the critically endangered [Endangered Species] and their habitat. We are working with local communities and international organizations to ensure their survival.",
    link: "/conservation/[endangered-species]"
  },
  projects: [
    {
      title: "Amazon Rainforest Preservation",
      description: "Supporting local communities in preserving the Amazon rainforest through sustainable practices.",
      image: "https://via.placeholder.com/400x200/4CAF50/FFFFFF?text=Amazon+Rainforest",
      link: "/conservation/amazon"
    },
    {
      title: "African Wildlife Protection",
      description: "Working to combat poaching and protect endangered species in Africa.",
      image: "https://via.placeholder.com/400x200/FF9800/000000?text=African+Wildlife",
      link: "/conservation/africa"
    },
    {
      title: "Ocean Cleanup Initiative",
      description: "Participating in global efforts to remove plastic waste from the oceans.",
      image: "https://via.placeholder.com/400x200/2196F3/FFFFFF?text=Ocean+Cleanup",
      link: "/conservation/ocean"
    }
  ],
  how_to_contribute: [
    {
      title: "Donate",
      description: "Support our conservation efforts with a donation.",
      link: "/donate"
    },
    {
      title: "Volunteer",
      description: "Join our team and help us make a difference.",
      link: "/volunteer"
    },
    {
      title: "Spread the Word",
      description: "Share our mission with your friends and family.",
      link: "/share"
    }
  ]
};

export default function Conservation() {
  const [conservationData, setConservationData] = useState(mockConservationData);

  useEffect(() => {
    // Simulate fetching data from an API
    // In a real application, you would replace this with an actual API call
    const fetchData = async () => {
      try {
        // const response = await fetch('/api/conservation');
        // const data = await response.json();
        // setConservationData(data);
        //If the API call failed, we'd fallback to the mock data, which is already loaded
      } catch (error) {
        console.error("Failed to fetch conservation data, using mock data:", error);
        // setConservationData(mockConservationData); //Not needed as it's already loaded initially
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12"
    >
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{conservationData.title}</h1>
        <p className="text-gray-700">{conservationData.body}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Conservation Highlight</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{conservationData.conservation_highlight.title}</h3>
          <p className="text-gray-700 mb-4">{conservationData.conservation_highlight.description}</p>
          <a href={conservationData.conservation_highlight.link} className="text-blue-500 hover:underline">Learn More</a>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conservationData.projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-700 mb-4">{project.description}</p>
                <a href={project.link} className="text-blue-500 hover:underline">Learn More</a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">How You Can Contribute</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conservationData.how_to_contribute.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md p-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-700 mb-4">{item.description}</p>
              <a href={item.link} className="text-blue-500 hover:underline">Learn More</a>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}