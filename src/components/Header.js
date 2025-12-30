import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaImages, 
  FaHandshake, 
  FaPhone, 
  FaHome,
  FaBars,
  FaTimes,
  FaCrown,
  FaUserCircle
} from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Home' },
    { path: '/winners', icon: <FaTrophy />, label: 'Winners' },
    { path: '/gallery', icon: <FaImages />, label: 'Gallery' },
    { path: '/sponsors', icon: <FaHandshake />, label: 'Sponsors' },
    { path: '/contact', icon: <FaPhone />, label: 'Contact' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'glass-morphism py-3' 
          : 'bg-gradient-to-b from-black/30 to-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-mpl-accent to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-mpl-accent/20 group-hover:shadow-mpl-accent/40 transition-shadow">
                <FaCrown className="text-2xl text-mpl-dark" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full">
                <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
              </div>
            </motion.div>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-display font-bold"
              >
                <span className="gradient-text">MPL</span>
              </motion.h1>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                Marellavaripalem Premier League
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 group relative ${
                  location.pathname === item.path
                    ? 'bg-mpl-accent/10 text-mpl-accent'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className={`text-lg transition-transform group-hover:scale-110 ${
                  location.pathname === item.path ? 'text-mpl-accent' : 'text-gray-400'
                }`}>
                  {item.icon}
                </span>
                <span className="font-semibold">{item.label}</span>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-mpl-accent to-transparent"
                  />
                )}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-mpl-accent/20 to-emerald-500/20 border border-mpl-accent/30 ml-4"
              >
                <FaUserCircle className="text-mpl-accent" />
                <span className="font-semibold">Admin</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-2xl text-mpl-accent p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-4 overflow-hidden"
          >
            <div className="glass-morphism rounded-2xl p-4 mx-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-mpl-accent/10 text-mpl-accent'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                ))}
                
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-mpl-accent/20 to-emerald-500/20 border border-mpl-accent/30 mt-2"
                  >
                    <FaUserCircle className="text-mpl-accent" />
                    <span className="font-semibold">Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;