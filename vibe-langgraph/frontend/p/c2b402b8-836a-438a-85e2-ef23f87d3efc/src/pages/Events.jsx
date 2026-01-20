import { useState, useEffect } from "react";
import EventCard from "../components/EventCard";
import { Calendar } from 'lucide-react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { tailwindMerge } from "tailwind-merge";

const mockEvents = [
  {
    id: 1,
    event_name: "Elephant Feeding Time",
    date: "2024-01-27",
    time: "14:00",
    location: "Elephant Enclosure",
    description: "Watch our zookeepers feed the African elephants and learn about their diet and behavior.",
    age_group: "All Ages",
    cost: "Free with zoo admission",
    image: "assets/elephant.jpg"
  },
  {
    id: 2,
    event_name: "Photography Workshop",
    date: "2024-02-15",
    time: "10:00",
    location: "Education Center",
    description: "Learn how to take stunning photos of wildlife with professional photographer.",
    age_group: "Adults",
    cost: "$50",
    image: "assets/photography_workshop.jpg"
  },
  {
    id: 3,
    event_name: "Zookeeper Talk: Lions",
    date: "2024-03-01",
    time: "11:00",
    location: "Lion Habitat",
    description: "Hear from our expert zookeepers about the lives and conservation of lions.",
    age_group: "All Ages",
    cost: "Free with zoo admission",
    image: "assets/zookeeper_talk.jpg"
  },
];

export default function Events() {
  const [events, setEvents] = useState(mockEvents);
  const [view, setView] = useState("list");

  useEffect(() => {
    // In a real application, you would fetch the events from an API here
    // Example:
    // async function fetchEvents() {
    //   const data = await api.getEvents();
    //   setEvents(data);
    // }
    // fetchEvents();
  }, []);

  const toggleView = () => {
    setView(view === "list" ? "calendar" : "list");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Upcoming Events</h1>
        <button
          className={tailwindMerge(
            "flex items-center gap-2 px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 active:scale-95 transition-transform",
            view === "list" ? "bg-green-500" : "bg-blue-500"
          )}
          onClick={toggleView}
        >
          <Calendar className="w-5 h-5" />
          {view === "list" ? "View Calendar" : "View List"}
        </button>
      </div>

      {view === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p>Calendar view coming soon!</p>
          {/* Implement calendar view here - consider using a library like react-big-calendar */}
        </div>
      )}
    </motion.div>
  );
}