import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Animals from './pages/Animals';
import AnimalDetail from './pages/AnimalDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Conservation from './pages/Conservation';
import Visit from './pages/Visit';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/animals/:animalId" element={<AnimalDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/conservation" element={<Conservation />} />
          <Route path="/visit" element={<Visit />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}