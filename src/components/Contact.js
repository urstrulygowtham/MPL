import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaWhatsapp, FaUser, FaMapMarkerAlt, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber] = useState('9347490073');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/contact');
      if (response.data.success) {
        setContacts(response.data.data);
      } else {
        // Fallback data
        setContacts([
          { name: "Marella Rosi Reddy", phone: "9908999817" },
          { name: "Marella Krishna Reddy", phone: "9989668139" },
          { name: "Marella Narasimha Reddy", phone: "9700451818" },
          { name: "Potlapalli Nasar Reddy", phone: "7989624919" },
          { name: "Marella Nagi Reddy", phone: "9000064339" }
        ]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Fallback data on error
      setContacts([
        { name: "Marella Rosi Reddy", phone: "9908999817" },
        { name: "Marella Krishna Reddy", phone: "9989668139" },
        { name: "Marella Narasimha Reddy", phone: "9700451818" },
        { name: "Potlapalli Nasar Reddy", phone: "7989624919" },
        { name: "Marella Nagi Reddy", phone: "9000064339" },
        { name: "Marella rami reddy", Phone: "8500723448"}
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone = whatsappNumber) => {
    const url = `https://wa.me/91${phone}`;
    window.open(url, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const openPhone = (phone) => {
    window.open(`tel:${phone}`);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            <span className="gradient-text">Contact Us</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get in touch with MPL organizers. We're here to help with any questions or inquiries.
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4">
        {/* Quick WhatsApp Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="glass-morphism rounded-3xl p-8 mb-12 text-center cursor-pointer"
          onClick={() => openWhatsApp()}
        >
          <div className="flex flex-col items-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
              <FaWhatsapp className="text-4xl text-white" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4">Quick WhatsApp Support</h3>
            <p className="text-gray-300 mb-6 text-lg">
              Click here to chat directly with our MPL support team. 
              We typically respond within minutes during tournament hours.
            </p>
            <div className="btn-primary bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <FaWhatsapp />
              <span>Chat on WhatsApp</span>
            </div>
            <p className="text-gray-400 text-sm mt-4">Phone: +91 {whatsappNumber}</p>
          </div>
        </motion.div>

        {/* Organizers Grid */}
        <section className="mb-16">
          <h2 className="section-title mb-8">
            <span className="gradient-text">MPL Organizers</span>
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="glass-morphism rounded-2xl p-6 card-hover"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-mpl-accent to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{contact.name}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FaPhone className="text-mpl-accent" />
                          <button
                            onClick={() => openPhone(contact.phone)}
                            className="text-gray-300 hover:text-mpl-accent transition-colors"
                          >
                            {contact.phone}
                          </button>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openWhatsApp(contact.phone)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
                          >
                            <FaWhatsapp className="text-green-400" />
                            <span className="text-green-400 font-medium">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => openPhone(contact.phone)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
                          >
                            <FaPhone className="text-blue-400" />
                            <span className="text-blue-400 font-medium">Call</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Location and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-morphism rounded-3xl p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FaMapMarkerAlt className="text-2xl text-mpl-accent" />
              <h3 className="text-2xl font-display font-bold">Tournament Location</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300 text-lg">
                Marellavaripalem Cricket Ground, Nuzendla Mandal, Andhra Pradesh
              </p>
              <p className="text-gray-400">
                The heart of cricket in our region, where legends are made and 
                community bonds are strengthened through the spirit of the game.
              </p>
              
              <div className="mt-6">
                <button
                  onClick={() => window.open('https://maps.google.com', '_blank')}
                  className="btn-secondary"
                >
                  <FaExternalLinkAlt />
                  Open in Google Maps
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tournament Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-morphism rounded-3xl p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FaClock className="text-2xl text-mpl-accent" />
              <h3 className="text-2xl font-display font-bold">Tournament Info</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Format</span>
                  <span className="font-semibold">T20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Seasons Completed</span>
                  <span className="font-semibold text-mpl-accent">13</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Teams per Season</span>
                  <span className="font-semibold">15+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Matches per Season</span>
                  <span className="font-semibold">30+</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-lg font-bold mb-4">Tournament Features</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center space-x-2">
                    <FaClock className="text-mpl-accent text-sm" />
                    <span>Professional Umpiring</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaClock className="text-mpl-accent text-sm" />
                    <span>Live Streaming</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaClock className="text-mpl-accent text-sm" />
                    <span>Awards Ceremony</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaClock className="text-mpl-accent text-sm" />
                    <span>Player Statistics</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        
      </div>
    </div>
  );
};

export default Contact;