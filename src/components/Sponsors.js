import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCrown, FaAward, FaMoneyBillWave, FaEdit, FaSave, FaStar, 
  FaShieldAlt, FaTrophy, FaMedal, FaGem, FaTimes, FaCheck, 
  FaTrash, FaPlus, FaLink
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLogin from './AdminLogin';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSponsor, setNewSponsor] = useState({
    type: 'post-match',
    awardName: '',
    sponsorName: '',
    sponsorDetails: '',
    priority: 0
  });

  useEffect(() => {
    fetchSponsors();
    checkAdmin();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://mpl-server-t9ib.onrender.com/api/sponsors');
      if (response.data.success) {
        setSponsors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      toast.error('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = () => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  };

  const handleEditClick = () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate data
      const invalidSponsors = sponsors.filter(sponsor => 
        !sponsor.sponsorName || !sponsor.awardName
      );
      
      if (invalidSponsors.length > 0) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await axios.put('https://mpl-server-t9ib.onrender.com/api/sponsors/update', {
        sponsors: sponsors
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.success) {
        setIsEditing(false);
        toast.success('Sponsors updated successfully!');
        fetchSponsors(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating sponsors:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
      } else {
        toast.error('Failed to update sponsors');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setIsEditing(false);
    toast.success('Logged out successfully');
  };

  const updateSponsorField = (sponsorId, field, value) => {
    const updated = sponsors.map(sponsor => {
      if (sponsor._id === sponsorId) {
        return { ...sponsor, [field]: value };
      }
      return sponsor;
    });
    setSponsors(updated);
  };

  const handleAddSponsor = () => {
    if (!newSponsor.awardName || !newSponsor.sponsorName) {
      toast.error('Please fill award name and sponsor name');
      return;
    }

    const newPriority = sponsors.length > 0 
      ? Math.max(...sponsors.map(s => s.priority)) + 1 
      : 1;
    
    // Create temporary ID for new sponsor
    const tempId = `temp-${Date.now()}`;
    const sponsorToAdd = {
      _id: tempId,
      ...newSponsor,
      priority: newPriority,
      isActive: true
    };

    setSponsors([...sponsors, sponsorToAdd]);
    setNewSponsor({
      type: 'post-match',
      awardName: '',
      sponsorName: '',
      sponsorDetails: '',
      priority: 0
    });
    setShowAddForm(false);
    toast.success('Sponsor added (Save to apply)');
  };

  const handleDeleteSponsor = (sponsorId) => {
    if (!window.confirm('Are you sure you want to delete this sponsor?')) {
      return;
    }
    const updated = sponsors.filter(sponsor => sponsor._id !== sponsorId);
    setSponsors(updated);
    toast.success('Sponsor removed (Save to apply)');
  };

  const getSponsorColor = (type) => {
    switch(type) {
      case 'title': return 'from-mpl-gold via-yellow-500 to-mpl-gold';
      case 'runner-up': return 'from-mpl-silver via-gray-400 to-mpl-silver';
      case 'third': return 'from-mpl-bronze via-orange-500 to-mpl-bronze';
      default: return 'from-mpl-accent via-emerald-500 to-cyan-500';
    }
  };

  const getSponsorIcon = (type) => {
    switch(type) {
      case 'title': return <FaCrown />;
      case 'runner-up': return <FaAward />;
      case 'third': return <FaMoneyBillWave />;
      default: return <FaStar />;
    }
  };

  const principalSponsors = sponsors.filter(s => ['title', 'runner-up', 'third'].includes(s.type));
  const postMatchSponsors = sponsors.filter(s => s.type === 'post-match');

  // Show admin login if not authenticated
  if (!isAdmin && window.location.pathname === '/admin') {
    return <AdminLogin setIsAdmin={setIsAdmin} />;
  }

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
            <span className="gradient-text">Our Sponsors</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Proudly supported by our valued partners who make MPL possible
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {/* Admin Controls */}
            <div className="flex justify-between items-center mb-8">
              <div>
                {isAdmin && (
                  <div className="flex items-center space-x-2 text-sm text-mpl-accent bg-mpl-accent/10 px-3 py-1 rounded-full">
                    <FaCheck />
                    <span>Admin Mode</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                {isAdmin ? (
                  <>
                    {isEditing ? (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            fetchSponsors(); // Reset to original data
                          }}
                          className="px-6 py-3 rounded-xl bg-mpl-primary hover:bg-mpl-primary/80 transition-colors flex items-center space-x-2"
                        >
                          <FaTimes />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? (
                            <>
                              <div className="loading-spinner w-5 h-5"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleLogout}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 hover:from-red-500/30 hover:to-rose-500/30 transition-all border border-red-500/30 flex items-center space-x-2"
                        >
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleEditClick}
                          className="btn-secondary"
                        >
                          <FaEdit />
                          Edit Sponsors
                        </button>
                        <button
                          onClick={handleLogout}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 hover:from-red-500/30 hover:to-rose-500/30 transition-all border border-red-500/30 flex items-center space-x-2"
                        >
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="btn-secondary"
                  >
                    <FaEdit />
                    Edit Sponsors
                  </button>
                )}
              </div>
            </div>

            {/* Principal Sponsors */}
            <section className="mb-16">
              <h2 className="section-title mb-8">
                <span className="gradient-text">Principal Sponsors</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {principalSponsors.map((sponsor) => (
                  <motion.div
                    key={sponsor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03 }}
                    className={`bg-gradient-to-br ${getSponsorColor(sponsor.type)} rounded-3xl p-8 text-center shadow-2xl card-hover relative`}
                  >
                    <div className="text-5xl mb-4">
                      {getSponsorIcon(sponsor.type)}
                    </div>
                    
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteSponsor(sponsor._id)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors z-10"
                      >
                        <FaTrash />
                      </button>
                    )}
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <select
                          value={sponsor.type}
                          onChange={(e) => updateSponsorField(sponsor._id, 'type', e.target.value)}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                          <option value="title">Title Sponsor</option>
                          <option value="runner-up">Runner-up Sponsor</option>
                          <option value="third">Third Place Sponsor</option>
                        </select>
                        <input
                          type="text"
                          value={sponsor.awardName || ''}
                          onChange={(e) => updateSponsorField(sponsor._id, 'awardName', e.target.value)}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Award Name"
                        />
                        <input
                          type="text"
                          value={sponsor.sponsorName || ''}
                          onChange={(e) => updateSponsorField(sponsor._id, 'sponsorName', e.target.value)}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Sponsor Name"
                        />
                        <textarea
                          value={sponsor.sponsorDetails || ''}
                          onChange={(e) => updateSponsorField(sponsor._id, 'sponsorDetails', e.target.value)}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-center text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Sponsor Details (Optional)"
                          rows="2"
                        />
                        <input
                          type="number"
                          value={sponsor.priority || 0}
                          onChange={(e) => updateSponsorField(sponsor._id, 'priority', parseInt(e.target.value))}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-center text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Priority"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-display font-bold mb-4">
                          {sponsor.awardName || sponsor.type.toUpperCase()}
                        </h3>
                        <p className="text-lg font-semibold mb-2">{sponsor.sponsorName}</p>
                        {sponsor.sponsorDetails && (
                          <p className="text-gray-800 text-sm">{sponsor.sponsorDetails}</p>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Post-Match Awards Sponsors */}
            <section className="mb-16">
              <div className="glass-morphism rounded-3xl p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-display font-bold mb-2">Post-Match Awards Sponsors</h2>
                    <p className="text-gray-400">Sponsors for individual match awards and recognitions</p>
                  </div>
                  
                  {isAdmin && isEditing && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="btn-secondary"
                    >
                      <FaPlus />
                      Add New Sponsor
                    </button>
                  )}
                </div>

                {/* Add New Sponsor Form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8 overflow-hidden"
                    >
                      <div className="bg-gradient-to-br from-mpl-accent/10 to-emerald-500/10 rounded-2xl p-6 border border-mpl-accent/30">
                        <h4 className="text-xl font-bold mb-4">Add New Sponsor</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Award Type</label>
                            <select
                              value={newSponsor.type}
                              onChange={(e) => setNewSponsor({...newSponsor, type: e.target.value})}
                              className="w-full bg-mpl-primary/50 border border-mpl-accent/30 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                            >
                              <option value="post-match">Post-Match Award</option>
                              <option value="title">Title Sponsor</option>
                              <option value="runner-up">Runner-up Sponsor</option>
                              <option value="third">Third Place Sponsor</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Award Name *</label>
                            <input
                              type="text"
                              value={newSponsor.awardName}
                              onChange={(e) => setNewSponsor({...newSponsor, awardName: e.target.value})}
                              placeholder="e.g., Player of the Match"
                              className="w-full bg-mpl-primary/50 border border-mpl-accent/30 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Sponsor Name *</label>
                            <input
                              type="text"
                              value={newSponsor.sponsorName}
                              onChange={(e) => setNewSponsor({...newSponsor, sponsorName: e.target.value})}
                              placeholder="Enter sponsor name"
                              className="w-full bg-mpl-primary/50 border border-mpl-accent/30 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Sponsor Details</label>
                            <input
                              type="text"
                              value={newSponsor.sponsorDetails}
                              onChange={(e) => setNewSponsor({...newSponsor, sponsorDetails: e.target.value})}
                              placeholder="Optional details"
                              className="w-full bg-mpl-primary/50 border border-mpl-accent/30 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="px-6 py-3 rounded-xl bg-mpl-primary hover:bg-mpl-primary/80 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddSponsor}
                            className="btn-primary"
                          >
                            <FaPlus />
                            Add Sponsor
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {postMatchSponsors.map((sponsor) => (
                    <motion.div
                      key={sponsor._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-mpl-secondary/50 to-transparent rounded-2xl p-6 border border-mpl-accent/20 relative"
                    >
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteSponsor(sponsor._id)}
                          className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors z-10"
                        >
                          <FaTrash />
                        </button>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="text-2xl text-mpl-accent">
                          <FaStar />
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={sponsor.awardName || ''}
                            onChange={(e) => updateSponsorField(sponsor._id, 'awardName', e.target.value)}
                            className="flex-1 bg-mpl-primary/50 border border-mpl-accent/30 rounded-xl p-2 focus:outline-none focus:border-mpl-accent focus:ring-2 focus:ring-mpl-accent/20"
                            placeholder="Award Name"
                          />
                        ) : (
                          <h4 className="text-lg font-semibold">{sponsor.awardName}</h4>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={sponsor.sponsorName || ''}
                            onChange={(e) => updateSponsorField(sponsor._id, 'sponsorName', e.target.value)}
                            placeholder="Enter sponsor name"
                            className="w-full bg-mpl-primary/50 border border-mpl-accent/30 rounded-xl p-3 focus:outline-none focus:border-mpl-accent focus:ring-2 focus:ring-mpl-accent/20"
                          />
                          <textarea
                            value={sponsor.sponsorDetails || ''}
                            onChange={(e) => updateSponsorField(sponsor._id, 'sponsorDetails', e.target.value)}
                            placeholder="Sponsor details (optional)"
                            className="w-full bg-mpl-primary/50 border border-mpl-accent/30 rounded-xl p-3 focus:outline-none focus:border-mpl-accent focus:ring-2 focus:ring-mpl-accent/20"
                            rows="2"
                          />
                          <input
                            type="number"
                            value={sponsor.priority || 0}
                            onChange={(e) => updateSponsorField(sponsor._id, 'priority', parseInt(e.target.value))}
                            placeholder="Priority"
                            className="w-full bg-mpl-primary/50 border border-mpl-accent/30 rounded-xl p-3 focus:outline-none focus:border-mpl-accent focus:ring-2 focus:ring-mpl-accent/20"
                          />
                        </div>
                      ) : (
                        <p className="text-mpl-accent font-bold text-lg">
                          {sponsor.sponsorName}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Sponsorship Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism rounded-3xl p-8 mb-8"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="lg:w-2/3">
                  <h3 className="text-2xl font-display font-bold mb-4">Become a Sponsor</h3>
                  <p className="text-gray-300 mb-6">
                    Join our prestigious list of sponsors and be part of the MPL legacy. 
                    Sponsorship opportunities are available for the upcoming season.
                  </p>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center space-x-2">
                      <FaStar className="text-mpl-accent" />
                      <span>Brand visibility across all MPL events</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FaStar className="text-mpl-accent" />
                      <span>Featured on our website and social media</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FaStar className="text-mpl-accent" />
                      <span>Exclusive access to MPL events</span>
                    </li>
                  </ul>
                </div>
                
                <div className="lg:w-1/3">
                  <div className="bg-gradient-to-br from-mpl-accent/20 to-emerald-500/20 rounded-2xl p-6 border border-mpl-accent/30">
                    <h4 className="text-xl font-bold mb-4">Contact for Sponsorship</h4>
                    <p className="text-gray-300 mb-4">
                      Interested in sponsoring MPL? Get in touch with our sponsorship team.
                    </p>
                    <a
                      href="https://wa.me/919347490073"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full text-center"
                    >
                      <FaLink className="mr-2" />
                      Contact Sponsorship Team
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sponsors;