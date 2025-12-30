import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DragDropButtons from './DragDropButtons';
import { 
  FaTrophy, 
  FaUsers, 
  FaCalendarAlt, 
  FaStar, 
  FaFire, 
  FaMedal, 
  FaCrown, 
  FaExternalLinkAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaBullhorn,
  FaVolleyballBall
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSeason, setLastSeason] = useState(13);
  const [lastSeasonWinner, setLastSeasonWinner] = useState('Edara');
  const [isAdmin, setIsAdmin] = useState(false);
  const [liveScoreLinks, setLiveScoreLinks] = useState([]);
  const [showLiveScoreModal, setShowLiveScoreModal] = useState(false);
  const [newLiveScoreLink, setNewLiveScoreLink] = useState({
    title: '',
    url: '',
    description: '',
    matchType: 'upcoming',
    season: 14,
    date: ''
  });
  const [editingLink, setEditingLink] = useState(null);

  useEffect(() => {
    // Add floating particles on mount
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    
    document.body.appendChild(particlesContainer);
    
    // Fetch winners data
    fetchWinners();
    
    // Check admin status
    checkAdmin();
    
    // Fetch live score links
    fetchLiveScoreLinks();
    
    return () => {
      document.body.removeChild(particlesContainer);
    };
  }, []);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://mpl-server-t9ib.onrender.com/api/winners');
      if (response.data.success && response.data.data.length > 0) {
        const winnersData = response.data.data;
        setWinners(winnersData);
        
        // Find the latest season
        const latestSeason = Math.max(...winnersData.map(w => w.season));
        setLastSeason(latestSeason);
        
        // Find the winner of the latest season
        const latestWinner = winnersData.find(w => w.season === latestSeason);
        if (latestWinner) {
          setLastSeasonWinner(latestWinner.teamName);
        }
      }
    } catch (error) {
      console.error('Error fetching winners:', error);
      toast.error('Failed to load winners data');
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = () => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  };

  const fetchLiveScoreLinks = async () => {
    try {
      const response = await axios.get('https://mpl-server-t9ib.onrender.com/api/live-scores');
      if (response.data.success) {
        setLiveScoreLinks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching live score links:', error);
      // Use default links if API fails
      setLiveScoreLinks([
        {
          id: 1,
          title: 'Season 14 Opening Match',
          url: 'https://cricheroes.com/mpl-season14',
          description: 'Watch live scores and updates',
          matchType: 'upcoming',
          season: 14,
          date: '2024-02-15',
          isActive: true
        },
        {
          id: 2,
          title: 'MPL All-Time Records',
          url: 'https://cricheroes.com/mpl-records',
          description: 'View player statistics and records',
          matchType: 'records',
          season: 'all',
          date: '2024-02-10',
          isActive: true
        }
      ]);
    }
  };

  const handleSaveLiveScoreLink = async () => {
    try {
      if (!newLiveScoreLink.title || !newLiveScoreLink.url) {
        toast.error('Please fill title and URL');
        return;
      }

      if (!newLiveScoreLink.url.includes('cricheroes.com')) {
        toast.error('URL must be from CricHeroes domain');
        return;
      }

      const token = localStorage.getItem('adminToken');
      
      if (editingLink) {
        // Update existing link
        const response = await axios.put(`https://mpl-server-t9ib.onrender.com/api/live-scores/${editingLink.id}`, newLiveScoreLink, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setLiveScoreLinks(liveScoreLinks.map(link => 
            link.id === editingLink.id ? response.data.data : link
          ));
          toast.success('Live score link updated!');
        }
      } else {
        // Add new link
        const response = await axios.post('https://mpl-server-t9ib.onrender.com/api/live-scores', newLiveScoreLink, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setLiveScoreLinks([response.data.data, ...liveScoreLinks]);
          toast.success('Live score link added!');
        }
      }
      
      setShowLiveScoreModal(false);
      setNewLiveScoreLink({
        title: '',
        url: '',
        description: '',
        matchType: 'upcoming',
        season: lastSeason + 1,
        date: ''
      });
      setEditingLink(null);
    } catch (error) {
      console.error('Error saving live score link:', error);
      toast.error('Failed to save live score link');
    }
  };

  const handleDeleteLiveScoreLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this live score link?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`https://mpl-server-t9ib.onrender.com/api/live-scores/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setLiveScoreLinks(liveScoreLinks.filter(link => link.id !== linkId));
        toast.success('Live score link deleted!');
      }
    } catch (error) {
      console.error('Error deleting live score link:', error);
      toast.error('Failed to delete live score link');
    }
  };

  const stats = [
    { icon: <FaTrophy />, label: 'Seasons', value: `${lastSeason}+`, color: 'from-mpl-gold to-yellow-400' },
    { icon: <FaUsers />, label: 'Teams', value: '15+', color: 'from-blue-400 to-cyan-400' },
    { icon: <FaCalendarAlt />, label: 'Years', value: '10+', color: 'from-emerald-400 to-green-400' },
    { icon: <FaFire />, label: 'Matches', value: '200+', color: 'from-orange-400 to-red-400' },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  // Get upcoming matches
  const upcomingMatches = liveScoreLinks.filter(link => 
    link.matchType === 'upcoming' || link.matchType === 'live'
  );

  // Get past matches
  const pastMatches = liveScoreLinks.filter(link => 
    link.matchType === 'completed' || link.matchType === 'records'
  );

  return (
    <div className="relative z-10 pt-20 px-4 sm:px-6">
      {/* Live Score Updates Banner */}
      {liveScoreLinks.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="container mx-auto">
            <div className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-mpl-accent/30 bg-gradient-to-r from-mpl-accent/5 to-emerald-500/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <FaBullhorn className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold mb-1">
                      Live Score Updates
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base">
                      Get real-time match scores and updates
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {upcomingMatches.slice(0, 2).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg hover:from-red-500/30 hover:to-orange-500/30 transition-all"
                    >
                      <FaFire className="text-red-400" />
                      <span className="font-semibold text-sm">{link.title}</span>
                    </a>
                  ))}
                  
                  {isAdmin && (
                    <button
                      onClick={() => setShowLiveScoreModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-mpl-accent/20 to-emerald-500/20 border border-mpl-accent/30 rounded-lg hover:from-mpl-accent/30 hover:to-emerald-500/30 transition-all"
                    >
                      <FaEdit className="text-mpl-accent" />
                      <span className="font-semibold text-sm">Manage Links</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-mpl-accent/10 via-transparent to-emerald-500/5 blur-3xl"></div>
        
        <div className="container mx-auto relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-mpl-accent/10 to-emerald-500/10 border border-mpl-accent/20">
              <FaStar className="text-mpl-accent animate-spin text-sm sm:text-base" style={{ animationDuration: '3s' }} />
              <span className="text-xs sm:text-sm font-semibold">WELCOME TO SEASON {lastSeason + 1}</span>
              <FaStar className="text-mpl-accent animate-spin text-sm sm:text-base" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-display font-bold mb-4 sm:mb-8 leading-tight">
              <span className="block">
                <span className="gradient-text">MARELLAVARIPALEM</span>
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-2 sm:mt-4">
                PREMIER LEAGUE
              </span>
            </h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2"
            >
              Where cricket passion meets community spirit. Celebrating a decade of 
              unforgettable matches, legendary players, and unforgettable moments.
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            >
              <Link to="/winners" className="btn-primary w-full sm:w-auto">
                <FaTrophy />
                <span className="text-sm sm:text-base">View Champions</span>
              </Link>
              <Link to="/gallery" className="btn-secondary w-full sm:w-auto">
                <FaMedal />
                <span className="text-sm sm:text-base">Explore Gallery</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Score Links Section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <FaFire className="text-2xl text-red-400" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
                  Live Score Links
                </h2>
              </div>
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingLink(null);
                    setNewLiveScoreLink({
                      title: '',
                      url: '',
                      description: '',
                      matchType: 'upcoming',
                      season: lastSeason + 1,
                      date: ''
                    });
                    setShowLiveScoreModal(true);
                  }}
                  className="btn-secondary"
                >
                  <FaEdit />
                  Add New Link
                </button>
              )}
            </div>

            {/* Upcoming/Live Matches */}
            {upcomingMatches.length > 0 && (
              <div className="mb-8 sm:mb-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Upcoming & Live Matches</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {upcomingMatches.map((link) => (
                    <motion.div
                      key={link.id}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 card-hover"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="inline-flex items-center space-x-2 mb-2">
                            <FaVolleyballBall className="text-red-400" />
                            <span className="text-xs sm:text-sm text-gray-400">
                              Season {link.season} • {link.matchType.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-bold">{link.title}</h4>
                        </div>
                        {isAdmin && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingLink(link);
                                setNewLiveScoreLink({
                                  title: link.title,
                                  url: link.url,
                                  description: link.description || '',
                                  matchType: link.matchType,
                                  season: link.season,
                                  date: link.date || ''
                                });
                                setShowLiveScoreModal(true);
                              }}
                              className="text-mpl-accent hover:text-emerald-400"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteLiveScoreLink(link.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {link.description && (
                        <p className="text-gray-300 text-sm mb-4">{link.description}</p>
                      )}
                      
                      {link.date && (
                        <div className="text-xs text-gray-400 mb-4">
                          Match Date: {new Date(link.date).toLocaleDateString()}
                        </div>
                      )}
                      
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
                      >
                        <FaExternalLinkAlt />
                        <span className="font-semibold">View on CricHeroes</span>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Matches & Records */}
            {pastMatches.length > 0 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center space-x-2">
                  <FaTrophy className="text-yellow-400" />
                  <span>Match Records & Statistics</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {pastMatches.map((link) => (
                    <motion.div
                      key={link.id}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 card-hover"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg sm:text-xl font-bold">{link.title}</h4>
                          <p className="text-gray-300 text-sm mt-1">{link.description}</p>
                        </div>
                        {isAdmin && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingLink(link);
                                setNewLiveScoreLink({
                                  title: link.title,
                                  url: link.url,
                                  description: link.description || '',
                                  matchType: link.matchType,
                                  season: link.season,
                                  date: link.date || ''
                                });
                                setShowLiveScoreModal(true);
                              }}
                              className="text-mpl-accent hover:text-emerald-400"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteLiveScoreLink(link.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all"
                      >
                        <FaExternalLinkAlt />
                        <span className="font-semibold">View Records</span>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {liveScoreLinks.length === 0 && (
              <div className="text-center py-12">
                <FaFire className="text-6xl text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">No Live Score Links</h3>
                <p className="text-gray-400 mb-6">
                  {isAdmin 
                    ? 'Add CricHeroes links to display live scores here' 
                    : 'Check back later for live score updates'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowLiveScoreModal(true)}
                    className="btn-primary"
                  >
                    <FaEdit />
                    Add First Live Score Link
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass-morphism rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center card-hover"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}>
                  <div className="text-xl sm:text-2xl text-white">{stat.icon}</div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 font-medium text-sm sm:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Current Champion Highlight - Dynamic */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="lg:w-2/3">
                <div className="inline-flex items-center space-x-2 mb-3 sm:mb-4">
                  <FaTrophy className="text-mpl-gold text-xl sm:text-2xl" />
                  <span className="text-xs sm:text-sm font-semibold text-mpl-accent">CURRENT CHAMPIONS</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6">
                  Season {lastSeason} Winners: <span className="gradient-text">{lastSeasonWinner}</span>
                </h2>
                
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                  {lastSeason === 13 ? 
                    'Defending their title with exceptional skill and teamwork, Edara has secured their place in MPL history with a stunning performance throughout Season 13.' :
                    `${lastSeasonWinner} has secured their place in MPL history with a stunning performance throughout Season ${lastSeason}.`
                  }
                </p>
                
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-mpl-gold/20 to-yellow-500/20 border border-mpl-gold/30">
                    <span className="font-semibold text-mpl-gold text-sm sm:text-base">🏆 Champions</span>
                  </div>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-mpl-silver/20 to-gray-400/20 border border-mpl-silver/30">
                    <span className="font-semibold text-mpl-silver text-sm sm:text-base">🥈 Runner-up</span>
                  </div>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-mpl-bronze/20 to-orange-500/20 border border-mpl-bronze/30">
                    <span className="font-semibold text-mpl-bronze text-sm sm:text-base">🥉 Third Place</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link to="/winners" className="btn-primary w-full sm:w-auto">
                    <FaTrophy />
                    View All Champions
                  </Link>
                </div>
              </div>
              
              <div className="lg:w-1/3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative"
                >
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-gradient-to-br from-mpl-gold via-yellow-500 to-mpl-gold rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-mpl-gold/30 animate-pulse-glow">
                    {lastSeason === 13 ? (
                      <FaTrophy className="text-5xl sm:text-6xl md:text-8xl text-white" />
                    ) : (
                      <FaCrown className="text-5xl sm:text-6xl md:text-8xl text-white" />
                    )}
                  </div>
                  <div className="absolute -top-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-mpl-accent/30 to-transparent rounded-full blur-xl"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Previous Champions Grid */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <FaTrophy className="text-xl sm:text-2xl text-mpl-accent" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
                  Previous Champions
                </h2>
              </div>
              <Link to="/winners" className="text-sm sm:text-base text-mpl-accent hover:text-emerald-400 transition-colors">
                View All →
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {winners.slice(0, 6).map((winner, index) => (
                  <motion.div
                    key={winner.season}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-mpl-secondary/50 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-mpl-accent/20 card-hover"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="inline-flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-mpl-accent to-emerald-500 rounded-full flex items-center justify-center">
                            <span className="font-bold text-xs text-white">{winner.season}</span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-400">Season {winner.season}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-mpl-accent">
                          {winner.teamName}
                        </h3>
                      </div>
                      {winner.season === lastSeason && (
                        <div className="px-2 py-1 bg-gradient-to-r from-mpl-gold/20 to-yellow-500/20 border border-mpl-gold/30 rounded-full">
                          <span className="text-xs font-semibold text-mpl-gold">Current</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {winner.captain && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <FaCrown className="text-yellow-400" />
                          <span>Captain: <span className="font-semibold text-gray-300">{winner.captain}</span></span>
                        </div>
                      )}
                      
                      {winner.runnerUp && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <FaMedal className="text-mpl-silver" />
                          <span>Runner-up: <span className="font-semibold text-gray-300">{winner.runnerUp}</span></span>
                        </div>
                      )}
                      
                      {winner.thirdPlace && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <FaStar className="text-mpl-bronze" />
                          <span>Third: <span className="font-semibold text-gray-300">{winner.thirdPlace}</span></span>
                        </div>
                      )}
                      
                      {winner.highlights && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{winner.highlights}</p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => window.location.href = `/winners#season-${winner.season}`}
                        className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-mpl-accent/20 to-emerald-500/20 border border-mpl-accent/30 rounded-lg hover:from-mpl-accent/30 hover:to-emerald-500/30 transition-all text-sm"
                      >
                        <FaTrophy className="text-mpl-accent" />
                        <span>View Season Details</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div className="mt-8 text-center">
              <Link to="/winners" className="btn-secondary">
                <FaTrophy />
                View Complete Winners History
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Drag & Drop Navigation */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-12"
          >
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl">
              <span className="gradient-text">Quick Navigation</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mt-2 sm:mt-4">
              Drag and drop these cards to customize your navigation. 
              Click to explore different sections of MPL.
            </p>
          </motion.div>
          
          <DragDropButtons />
        </div>
      </section>

      {/* Live Score Modal */}
      {showLiveScoreModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-morphism rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold">
                {editingLink ? 'Edit Live Score Link' : 'Add Live Score Link'}
              </h3>
              <button
                onClick={() => {
                  setShowLiveScoreModal(false);
                  setEditingLink(null);
                  setNewLiveScoreLink({
                    title: '',
                    url: '',
                    description: '',
                    matchType: 'upcoming',
                    season: lastSeason + 1,
                    date: ''
                  });
                }}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={newLiveScoreLink.title}
                  onChange={(e) => setNewLiveScoreLink({...newLiveScoreLink, title: e.target.value})}
                  placeholder="e.g., Season 14 Opening Match"
                  className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CricHeroes URL *</label>
                <input
                  type="url"
                  value={newLiveScoreLink.url}
                  onChange={(e) => setNewLiveScoreLink({...newLiveScoreLink, url: e.target.value})}
                  placeholder="https://cricheroes.com/..."
                  className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                />
                <p className="text-xs text-gray-400 mt-1">Must be a CricHeroes.com link</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newLiveScoreLink.description}
                  onChange={(e) => setNewLiveScoreLink({...newLiveScoreLink, description: e.target.value})}
                  placeholder="Brief description of the match..."
                  rows="2"
                  className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Match Type</label>
                  <select
                    value={newLiveScoreLink.matchType}
                    onChange={(e) => setNewLiveScoreLink({...newLiveScoreLink, matchType: e.target.value})}
                    className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="records">Records</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Season</label>
                  <input
                    type="number"
                    value={newLiveScoreLink.season}
                    onChange={(e) => setNewLiveScoreLink({...newLiveScoreLink, season: parseInt(e.target.value) || lastSeason + 1})}
                    min="1"
                    className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Match Date (Optional)</label>
                <input
                  type="date"
                  value={newLiveScoreLink.date}
                  onChange={(e) => setNewLiveScoreLink({...newLiveScoreLink, date: e.target.value})}
                  className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowLiveScoreModal(false);
                    setEditingLink(null);
                    setNewLiveScoreLink({
                      title: '',
                      url: '',
                      description: '',
                      matchType: 'upcoming',
                      season: lastSeason + 1,
                      date: ''
                    });
                  }}
                  className="px-6 py-3 rounded-xl bg-mpl-primary hover:bg-mpl-primary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLiveScoreLink}
                  className="btn-primary"
                >
                  <FaSave />
                  {editingLink ? 'Update Link' : 'Add Link'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;