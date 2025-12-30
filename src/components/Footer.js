import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-gray-900 border-t border-gray-800 mt-16"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="bg-gradient-to-r from-mpl-accent to-yellow-400 bg-clip-text text-transparent">
                MPL
              </span>
            </h3>
            <p className="text-gray-400 mb-6">
              Marellavaripalem Premier League - Celebrating cricket, community, and sportsmanship since 2013.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-mpl-accent transition duration-300">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-mpl-accent transition duration-300">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-mpl-accent transition duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-mpl-accent transition duration-300">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/winners" className="text-gray-400 hover:text-mpl-accent transition duration-300">
                  Winners List
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-400 hover:text-mpl-accent transition duration-300">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/sponsors" className="text-gray-400 hover:text-mpl-accent transition duration-300">
                  Our Sponsors
                </Link>
              </li>
              <li>
                <a 
                  href="https://cricheroes.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-mpl-accent transition duration-300"
                >
                  Live Scores
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Marellavaripalem Cricket Ground</li>
              <li>Nuzendla Mandal, Andhra Pradesh</li>
              <li>WhatsApp: +91 9347490073</li>
              <li>Email: info@mplcricket.com</li>
            </ul>
          </div>

          {/* Sponsors */}
          <div>
            <h4 className="text-lg font-bold mb-4">Title Sponsor</h4>
            <div className="bg-gradient-to-r from-mpl-primary to-gray-800 p-4 rounded-lg">
              <p className="font-semibold text-mpl-accent">Sri Nakka Nagireddy Garu</p>
              <p className="text-sm text-gray-400">Nuzendla Mandal, YSRCP Ex-Convener</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Copyright */}
        <div className="text-center text-gray-500">
          <p className="flex items-center justify-center">
            Made with <FaHeart className="text-red-500 mx-2" /> by MPL Organizers 
            © {currentYear} Marellavaripalem Premier League. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;