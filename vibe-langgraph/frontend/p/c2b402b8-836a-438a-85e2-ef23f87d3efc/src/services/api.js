// src/services/api.js

const API_BASE_URL = 'http://localhost:8000';

// Mock data for fallback
const mockAnimals = [
  {
    id: '1',
    name: 'African Elephant',
    species: 'Loxodonta africana',
    image: 'assets/elephant.png',
    description: 'The African elephant is the largest land animal on Earth.',
    habitat: 'Savannas, grasslands',
    diet: 'Herbivorous',
    conservationStatus: 'Vulnerable',
    funFact: 'Elephants can communicate using infrasound.',
  },
  {
    id: '2',
    name: 'Lion',
    species: 'Panthera leo',
    image: 'assets/lion.jpg',
    description: 'The lion is a species in the family Felidae and a member of the genus Panthera.',
    habitat: 'Savannas, grasslands',
    diet: 'Carnivorous',
    conservationStatus: 'Vulnerable',
    funFact: 'Lions are the only cats that live in social groups, called prides.',
  },
  {
    id: '3',
    name: 'Giraffe',
    species: 'Giraffa camelopardalis',
    image: 'https://www.example.com/giraffe.jpg',
    description: 'Giraffes are the tallest mammals on Earth. They are known for their long necks and distinctive spots.',
    habitat: 'Savannas, grasslands',
    diet: 'Herbivorous',
    conservationStatus: 'Vulnerable',
    funFact: 'A giraffe\'s neck is about 6 feet long.',
  },
];

const mockEvents = [
  {
    id: '1',
    name: 'Elephant Feeding Time',
    date: '2024-03-15',
    time: '2:00 PM',
    location: 'Elephant Enclosure',
    description: 'Watch our zookeepers feed the African elephants and learn about their diet.',
    ageGroup: 'All Ages',
    cost: 'Free with zoo admission',
    image: 'assets/elephant.png',
  },
  {
    id: '2',
    name: 'Zookeeper Talk: Lions',
    date: '2024-03-22',
    time: '11:00 AM',
    location: 'Lion Enclosure',
    description: 'Learn about lions from our expert zookeepers.',
    ageGroup: 'All Ages',
    cost: 'Free with zoo admission',
    image: 'assets/lion.jpg',
  },
  {
    id: '3',
    name: 'Photography Workshop',
    date: '2024-04-05',
    time: '10:00 AM',
    location: 'Education Center',
    description: 'Improve your wildlife photography skills.',
    ageGroup: 'Adults',
    cost: '$50',
    image: 'assets/photography_workshop.jpg',
  },
];

const mockEducation = [
  {
    id: '1',
    title: 'Conservation Corner',
    description: 'Learn about our conservation efforts and how you can help protect endangered species.',
    link: '/conservation',
    image: 'assets/elephant.png',
  },
  {
    id: '2',
    title: 'Zoo Careers',
    description: 'Discover the exciting careers available at the zoo and how to get involved.',
    link: '/about',
    image: 'assets/lion.jpg',
  },
  {
    id: '3',
    title: 'Wildlife Facts',
    description: 'Explore fascinating facts about animals from around the world.',
    link: '/animals',
    image: 'https://www.example.com/giraffe.jpg',
  },
];

async function getAnimals() {
  try {
    const response = await fetch(`${API_BASE_URL}/animals`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching animals:', error);
    return mockAnimals;
  }
}

async function getEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return mockEvents;
  }
}

async function getEducation() {
  try {
    const response = await fetch(`${API_BASE_URL}/education`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching education resources:', error);
    return mockEducation;
  }
}

export { getAnimals, getEvents, getEducation };