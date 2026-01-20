import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import EventCard from "../components/EventCard";
import EducationCard from "../components/EducationCard";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Mock Data
  const heroHeadline = "Roar into Adventure! Explore Wildlife Wonders.";
  const heroSubheadline =
    "Discover amazing animals, exciting events, and make unforgettable memories at [Zoo Name]!";

  const animalProfiles = {
    title: "Meet Our Residents",
    body: "Embark on a journey through the animal kingdom! From the majestic African Elephant to the playful river otters, [Zoo Name] is home to a diverse array of fascinating creatures. Explore their unique stories, habitats, and conservation status. Learn about what we are doing to protect these animals, and what you can do to help.",
    animals: [
      {
        title: "African Elephant",
        image_url: "/assets/elephant.png",
        description:
          "The African elephant is the largest land animal on Earth. Learn about their intelligence, trunk skills, and family life!",
        link: "/animals/african-elephant",
      },
      {
        title: "Lion",
        image_url: "/assets/lion.jpg",
        description:
          "The lion is a majestic creature and is known as the king of the jungle. Learn more about their behavior and habitat!",
        link: "/animals/lion",
      },
    ],
  };

  const eventsCalendar = {
    title: "Wild Times Ahead: Daily Events & Special Programs",
    body: "There's always something happening at [Zoo Name]! Join us for daily events like Elephant Feeding Time at 2:00 PM, or get involved in our special educational programs. Check our calendar for upcoming seasonal festivals, conservation talks, and behind-the-scenes tours. Plan your visit around the events that excite you most!",
    events: [
      {
        event_name: "Elephant Feeding Time",
        date: "January 27, 2024",
        time: "2:00 PM",
        location: "Elephant Enclosure",
        description:
          "Watch our zookeepers feed the African elephants and learn about their diet and behavior.",
        link: "/events/elephant-feeding",
        image_url: "/assets/elephant.png",
      },
      {
        event_name: "Photography Workshop",
        date: "February 15, 2024",
        time: "10:00 AM",
        location: "Education Center",
        description:
          "Learn how to take stunning photos of our animals with professional photographers.",
        link: "/events/photography-workshop",
        image_url: "/assets/photography_workshop.jpg",
      },
    ],
  };

  const conservationEducation = {
    title: "Conservation in Action: Protecting Wildlife for Future Generations",
    body: "[Zoo Name] is deeply committed to conservation and education. We actively participate in research projects, support wildlife protection programs, and educate visitors about the importance of biodiversity. Discover how you can contribute to our efforts and help us make a difference in the lives of animals worldwide. Learn about our breeding programs and our global partnerships.",
    conservation_highlight: {
      title: "Saving the [Endangered Species]",
      description:
        "Learn about our groundbreaking work to protect the critically endangered [Endangered Species] and their habitat. We are working with local communities and international organizations to ensure their survival.",
      link: "/conservation/[endangered-species]",
    },
  };

  return (
    <motion.div
      className="overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <motion.div
        className="relative h-screen flex items-center justify-center text-center text-white bg-gray-800 overflow-hidden"
        style={{
          background: `url('/assets/lion.jpg') center/cover no-repeat`,
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {heroHeadline}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {heroSubheadline}
          </motion.p>
          <motion.div
            className="flex items-center justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              to="/visit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              Buy Tickets Now!
            </Link>
            <Link
              to="/animals"
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              Explore Our Animals
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Animal Profiles Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            {animalProfiles.title}
          </h2>
          <p className="text-gray-700 mb-8 text-center">{animalProfiles.body}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {animalProfiles.animals.map((animal, index) => (
              <AnimalCard key={index} animal={animal} />
            ))}
          </div>
        </div>
      </section>

      {/* Events Calendar Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            {eventsCalendar.title}
          </h2>
          <p className="text-gray-700 mb-8 text-center">{eventsCalendar.body}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsCalendar.events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Conservation and Education Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            {conservationEducation.title}
          </h2>
          <p className="text-gray-700 mb-8 text-center">
            {conservationEducation.body}
          </p>
          <div className="flex flex-col items-center">
            <EducationCard
              title={conservationEducation.conservation_highlight.title}
              description={
                conservationEducation.conservation_highlight.description
              }
              link={conservationEducation.conservation_highlight.link}
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
}