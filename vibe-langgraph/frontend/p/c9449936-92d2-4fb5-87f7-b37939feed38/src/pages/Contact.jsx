import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-12 px-6 md:px-12 lg:px-24"
    >
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h2>
        <p className="text-gray-600">
          Have questions or want to learn more? Get in touch with us!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white/50 backdrop-blur-lg rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Send us a message</h3>
          <form>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your message"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:scale-105 active:scale-95 transition-transform duration-75"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-white/50 backdrop-blur-lg rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Contact Information</h3>
          <div className="flex items-center mb-2">
            <MapPin className="text-gray-500 mr-2" size={20} />
            <p className="text-gray-700">
              Check our website or social media for our current location!
            </p>
          </div>
          <div className="flex items-center mb-2">
            <Phone className="text-gray-500 mr-2" size={20} />
            <p className="text-gray-700">
              <a href="tel:+15551234567" className="hover:text-orange-500 transition-colors duration-150">+1 (555) 123-4567</a>
            </p>
          </div>
          <div className="flex items-center mb-2">
            <Mail className="text-gray-500 mr-2" size={20} />
            <p className="text-gray-700">
              <a href="mailto:info@indianfoodcart.com" className="hover:text-orange-500 transition-colors duration-150">info@indianfoodcart.com</a>
            </p>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Follow us
            </h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors duration-150">
                {/* Placeholder for social media icons */}
                Facebook
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors duration-150">
                {/* Placeholder for social media icons */}
                Instagram
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors duration-150">
                {/* Placeholder for social media icons */}
                Twitter
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}