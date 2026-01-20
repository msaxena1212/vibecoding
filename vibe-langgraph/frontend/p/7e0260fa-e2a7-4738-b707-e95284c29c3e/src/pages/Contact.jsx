import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Mail } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null); // Reset status

    try {
      // Simulate a form submission (replace with your actual API endpoint)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 seconds delay

      // Basic validation (you should enhance this)
      if (!name || !email || !message) {
        throw new Error("Please fill in all fields.");
      }

      // Simulate success
      setSubmissionStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="container mx-auto py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-orange-600 mb-6 text-center">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-lg shadow-md p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Send us a message</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-300 text-sm font-bold mb-2">
                Message
              </label>
              <textarea
                id="message"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 h-32 resize-none"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <motion.button
              type="submit"
              className={`bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? 'Submitting...' : 'Send Message'}
            </motion.button>

            {submissionStatus === 'success' && (
              <div className="mt-4 text-green-500">
                Thank you! Your message has been sent.
              </div>
            )}

            {submissionStatus === 'error' && (
              <div className="mt-4 text-red-500">
                Oops! There was an error submitting your message. Please try again.
              </div>
            )}
          </form>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-lg shadow-md p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
          <div className="flex items-center mb-3">
            <Phone className="text-orange-500 mr-2" size={20} />
            <p className="text-gray-300">+1 (555) 123-4567</p>
          </div>
          <div className="flex items-center mb-3">
            <MapPin className="text-orange-500 mr-2" size={20} />
            <p className="text-gray-300">123 Curry Street, San Francisco, CA</p>
          </div>
          <div className="flex items-center">
            <Mail className="text-orange-500 mr-2" size={20} />
            <p className="text-gray-300">info@indianstreetflavors.com</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}