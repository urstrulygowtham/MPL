import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaMedal, FaCamera, FaCloudUploadAlt, FaCrown, FaStar, FaHistory, FaExternalLinkAlt, FaPlus, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { uploadWinnerImage } from '../utils/cloudinary';

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(13);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddSeasonModal, setShowAddSeasonModal] = useState(false);
  const [newSeasonData, setNewSeasonData] = useState({
    season: '',
    teamName: '',
    captain: '',
    runnerUp: '',
    thirdPlace: '',
    highlights: ''
  });

  useEffect(() => {
    fetchWinners();
    checkAdmin();
  }, []);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/winners');
      if (response.data.success) {
        setWinners(response.data.data.sort((a, b) => b.season - a.season));
      }
    } catch (error) {
      console.error('Error fetching winners:', error);
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = () => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  };

  const handleImageUpload = async (event, season) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      const uploadResult = await uploadWinnerImage(file, season);

      if (uploadResult.success) {
        const response = await axios.put(`/api/winners/season/${season}/image`, {
          imageUrl: uploadResult.url,
          cloudinaryId: uploadResult.public_id
        });

        if (response.data.success) {
          setWinners(prev => prev.map(winner => 
            winner.season === season 
              ? { ...winner, imageUrl: uploadResult.url }
              : winner
          ));
          
          toast.success('Image uploaded successfully!');
        }
      } else {
        toast.error(uploadResult.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSeason = async () => {
    try {
      if (!newSeasonData.season || !newSeasonData.teamName) {
        toast.error('Please fill season number and team name');
        return;
      }

      const seasonNum = parseInt(newSeasonData.season);
      if (isNaN(seasonNum) || seasonNum < 1) {
        toast.error('Please enter a valid season number');
        return;
      }

      const response = await axios.post('/api/winners/add', newSeasonData);
      
      if (response.data.success) {
        setWinners([...winners, response.data.data].sort((a, b) => b.season - a.season));
        setSelectedSeason(seasonNum);
        setShowAddSeasonModal(false);
        setNewSeasonData({
          season: '',
          teamName: '',
          captain: '',
          runnerUp: '',
          thirdPlace: '',
          highlights: ''
        });
        toast.success('New season added successfully!');
      }
    } catch (error) {
      console.error('Add season failed:', error);
      toast.error(error.response?.data?.message || 'Failed to add season');
    }
  };

  const getTrophyColor = (season, maxSeason) => {
    if (season === maxSeason) return 'text-mpl-gold animate-pulse-glow';
    if (season <= 3) return 'text-mpl-gold';
    return 'text-mpl-accent';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const getMaxSeason = () => {
    return winners.length > 0 ? Math.max(...winners.map(w => w.season)) : 13;
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4 sm:mb-6">
          <span className="gradient-text">MPL Champions</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-2">
          Celebrating legendary teams and unforgettable victories
        </p>
      </motion.div>

      <div className="container mx-auto">
        {/* Admin Add Season Button */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <button
              onClick={() => setShowAddSeasonModal(true)}
              className="btn-primary w-full sm:w-auto"
            >
              <FaPlus />
              Add New Season
            </button>
          </motion.div>
        )}

        {/* Seasons Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="mb-8 sm:mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-display font-bold">
                  All Seasons
                </h2>
                <div className="text-sm text-gray-400">
                  Total: {winners.length} seasons
                </div>
              </div>
              
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
              >
                {winners.map((winner) => {
                  const isSelected = selectedSeason === winner.season;
                  const maxSeason = getMaxSeason();
                  
                  return (
                    <motion.div
                      key={winner.season}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedSeason(winner.season)}
                      className={`relative cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'ring-2 sm:ring-3 ring-mpl-accent shadow-lg sm:shadow-2xl shadow-mpl-accent/20' 
                          : 'hover:ring-1 sm:hover:ring-2 hover:ring-mpl-accent/30'
                      }`}
                    >
                      <div className="glass-morphism rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center h-full">
                        {/* Season Badge */}
                        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-mpl-accent to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="font-bold text-xs sm:text-sm">{winner.season}</span>
                        </div>
                        
                        {/* Trophy Icon */}
                        <div className="mb-2 sm:mb-4">
                          <div className={`text-3xl sm:text-4xl md:text-5xl ${getTrophyColor(winner.season, maxSeason)}`}>
                            {winner.season === maxSeason ? (
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <FaCrown />
                              </motion.div>
                            ) : (
                              <FaTrophy />
                            )}
                          </div>
                        </div>
                        
                        {/* Team Name */}
                        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 line-clamp-2">
                          {winner.teamName}
                        </h3>
                        
                        <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Season {winner.season}</p>
                        
                        {/* Upload Button (Admin Only) */}
                        {isAdmin && (
                          <label className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm bg-gradient-to-r from-mpl-accent/20 to-emerald-500/20 px-2 py-1 sm:px-3 sm:py-1 rounded-full cursor-pointer hover:from-mpl-accent/30 hover:to-emerald-500/30 transition-all">
                              <FaCloudUploadAlt className="text-xs" />
                              <span>Upload</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, winner.season)}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Selected Season Details - Mobile Optimized */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSeason}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-8"
              >
                <div className="flex flex-col lg:flex-row items-stretch gap-6 sm:gap-8">
                  {/* Left Side - Details */}
                  <div className="lg:w-2/3 space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-mpl-gold to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaTrophy className="text-xl sm:text-3xl text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
                          Season {selectedSeason} Champions
                        </h2>
                        <p className="text-xl sm:text-2xl text-mpl-accent font-bold mt-1">
                          {winners.find(w => w.season === selectedSeason)?.teamName || 'Loading...'}
                        </p>
                      </div>
                    </div>

                    {/* Stats - Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-gradient-to-br from-mpl-gold/10 to-yellow-500/10 border border-mpl-gold/20 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaCrown className="text-mpl-gold" />
                          <span className="font-bold text-mpl-gold text-sm sm:text-base">🏆 Champions</span>
                        </div>
                        <p className="text-base sm:text-lg font-semibold">
                          {winners.find(w => w.season === selectedSeason)?.teamName || 'Loading...'}
                        </p>
                      </div>
                      
                      {winners.find(w => w.season === selectedSeason)?.runnerUp && (
                        <div className="bg-gradient-to-br from-mpl-silver/10 to-gray-400/10 border border-mpl-silver/20 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaMedal className="text-mpl-silver" />
                            <span className="font-bold text-mpl-silver text-sm sm:text-base">🥈 Runner-up</span>
                          </div>
                          <p className="text-base sm:text-lg font-semibold">
                            {winners.find(w => w.season === selectedSeason)?.runnerUp}
                          </p>
                        </div>
                      )}
                      
                      {winners.find(w => w.season === selectedSeason)?.thirdPlace && (
                        <div className="bg-gradient-to-br from-mpl-bronze/10 to-orange-500/10 border border-mpl-bronze/20 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaStar className="text-mpl-bronze" />
                            <span className="font-bold text-mpl-bronze text-sm sm:text-base">🥉 Third Place</span>
                          </div>
                          <p className="text-base sm:text-lg font-semibold">
                            {winners.find(w => w.season === selectedSeason)?.thirdPlace}
                          </p>
                        </div>
                      )}
                      
                      {winners.find(w => w.season === selectedSeason)?.captain && (
                        <div className="bg-gradient-to-br from-mpl-accent/10 to-emerald-500/10 border border-mpl-accent/20 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaStar className="text-mpl-accent" />
                            <span className="font-bold text-mpl-accent text-sm sm:text-base">👑 Captain</span>
                          </div>
                          <p className="text-base sm:text-lg font-semibold">
                            {winners.find(w => w.season === selectedSeason)?.captain}
                          </p>
                        </div>
                      )}
                      
                      {winners.find(w => w.season === selectedSeason)?.highlights && (
                        <div className="lg:col-span-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaHistory className="text-purple-400" />
                            <span className="font-bold text-purple-400 text-sm sm:text-base">Highlights</span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-300">
                            {winners.find(w => w.season === selectedSeason)?.highlights}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CricHeroes Link */}
                    <div className="mt-4 sm:mt-6">
                      <button
                        onClick={() => window.open('https://cricheroes.com', '_blank')}
                        className="btn-secondary w-full sm:w-auto"
                      >
                        <FaExternalLinkAlt />
                        View Match Scorecards
                      </button>
                    </div>
                  </div>

                  {/* Right Side - Image - Mobile Optimized */}
                  <div className="lg:w-1/3">
                    <div className="relative">
                      <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-mpl-accent/30 bg-gradient-to-br from-mpl-secondary to-mpl-primary">
                        {winners.find(w => w.season === selectedSeason)?.imageUrl ? (
                          <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            src={winners.find(w => w.season === selectedSeason).imageUrl}
                            alt={`Season ${selectedSeason} Champions`}
                            className="w-full h-full object-cover image-zoom"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x400?text=Team+Photo';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
                            <FaCamera className="text-4xl sm:text-6xl text-gray-600 mb-3 sm:mb-4" />
                            <p className="text-gray-500 text-center text-sm sm:text-base">
                              No team photo uploaded yet
                            </p>
                            {isAdmin && (
                              <label className="mt-3 sm:mt-4">
                                <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-mpl-accent to-emerald-500 rounded-lg cursor-pointer hover:shadow-lg transition-shadow text-sm sm:text-base">
                                  <FaCloudUploadAlt />
                                  <span>Upload Team Photo</span>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload(e, selectedSeason)}
                                  disabled={uploading}
                                />
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Overlay (Admin Only) */}
                      {isAdmin && winners.find(w => w.season === selectedSeason)?.imageUrl && (
                        <label className="absolute top-3 right-3 sm:top-4 sm:right-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-mpl-accent to-emerald-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                            <FaCloudUploadAlt className="text-white text-sm sm:text-base" />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, selectedSeason)}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                    
                    {/* Match Date */}
                    {winners.find(w => w.season === selectedSeason)?.matchDate && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-400">
                          Match Date: {new Date(winners.find(w => w.season === selectedSeason).matchDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* History Timeline for Desktop */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass-morphism rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FaHistory className="text-2xl text-mpl-accent" />
              <h3 className="text-2xl font-display font-bold">Recent Champions</h3>
            </div>
            
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-mpl-accent via-emerald-500 to-transparent"></div>
              
              <div className="space-y-6 ml-12">
                {winners.slice(0, 5).map((winner) => (
                  <motion.div
                    key={winner.season}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
                      <div className={`w-8 h-8 rounded-full border-2 ${
                        winner.season === getMaxSeason() 
                          ? 'border-mpl-gold bg-mpl-gold/20' 
                          : 'border-mpl-accent bg-mpl-accent/10'
                      } flex items-center justify-center`}>
                        <div className={`w-3 h-3 rounded-full ${
                          winner.season === getMaxSeason() ? 'bg-mpl-gold' : 'bg-mpl-accent'
                        }`}></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-mpl-secondary/50 to-transparent rounded-xl p-4 hover:from-mpl-secondary/70 transition-all cursor-pointer"
                         onClick={() => setSelectedSeason(winner.season)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-400">Season {winner.season}</span>
                          <h4 className="text-xl font-bold">{winner.teamName}</h4>
                          {winner.captain && (
                            <p className="text-sm text-gray-400">Captain: {winner.captain}</p>
                          )}
                        </div>
                        <div className="text-mpl-accent hover:text-emerald-400 transition-colors">
                          View →
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Season Modal */}
      <AnimatePresence>
        {showAddSeasonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAddSeasonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-morphism rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display font-bold">Add New Season</h3>
                <button
                  onClick={() => setShowAddSeasonModal(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Season Number *</label>
                  <input
                    type="number"
                    min="14"
                    value={newSeasonData.season}
                    onChange={(e) => setNewSeasonData({...newSeasonData, season: e.target.value})}
                    placeholder="e.g., 14, 15, 16..."
                    className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Winning Team Name *</label>
                  <input
                    type="text"
                    value={newSeasonData.teamName}
                    onChange={(e) => setNewSeasonData({...newSeasonData, teamName: e.target.value})}
                    placeholder="Enter winning team name"
                    className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Captain</label>
                    <input
                      type="text"
                      value={newSeasonData.captain}
                      onChange={(e) => setNewSeasonData({...newSeasonData, captain: e.target.value})}
                      placeholder="Team captain"
                      className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Runner-up Team</label>
                    <input
                      type="text"
                      value={newSeasonData.runnerUp}
                      onChange={(e) => setNewSeasonData({...newSeasonData, runnerUp: e.target.value})}
                      placeholder="Runner-up team"
                      className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Third Place Team</label>
                    <input
                      type="text"
                      value={newSeasonData.thirdPlace}
                      onChange={(e) => setNewSeasonData({...newSeasonData, thirdPlace: e.target.value})}
                      placeholder="Third place team"
                      className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Match Date</label>
                    <input
                      type="date"
                      onChange={(e) => setNewSeasonData({...newSeasonData, matchDate: e.target.value})}
                      className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Season Highlights</label>
                  <textarea
                    value={newSeasonData.highlights}
                    onChange={(e) => setNewSeasonData({...newSeasonData, highlights: e.target.value})}
                    placeholder="Brief highlights of the season..."
                    rows="3"
                    className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowAddSeasonModal(false)}
                    className="px-6 py-3 rounded-xl bg-mpl-primary hover:bg-mpl-primary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSeason}
                    className="btn-primary"
                  >
                    <FaPlus />
                    Add Season
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Winners;