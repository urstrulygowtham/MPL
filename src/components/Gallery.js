import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaImages, FaTrash, FaFilter, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { uploadGalleryImage } from '../utils/cloudinary';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchGalleryImages();
    checkAdmin();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://mpl-server-t9ib.onrender.com/api/gallery');
      if (response.data.success) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = () => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  };

  const categories = [
    { id: 'all', label: 'All Photos', icon: <FaImages />, color: 'from-blue-500 to-cyan-500' },
    { id: 'matches', label: 'Match Photos', icon: <FaImages />, color: 'from-green-500 to-emerald-500' },
    { id: 'winners', label: 'Winners', icon: <FaImages />, color: 'from-yellow-500 to-orange-500' },
    { id: 'ceremony', label: 'Award Ceremony', icon: <FaImages />, color: 'from-purple-500 to-pink-500' },
    { id: 'teams', label: 'Team Photos', icon: <FaImages />, color: 'from-red-500 to-rose-500' },
  ];

  const seasons = Array.from({ length: 13 }, (_, i) => i + 1);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      
      // Upload directly to Cloudinary
      const uploadResult = await uploadGalleryImage(
        selectedFile, 
        activeTab === 'all' ? 'general' : activeTab
      );

      if (uploadResult.success) {
        // Save to MongoDB
        const saveResponse = await axios.post('https://mpl-server-t9ib.onrender.com/api/gallery/add', {
          title: selectedFile.name.split('.')[0],
          imageUrl: uploadResult.url,
          category: activeTab === 'all' ? 'general' : activeTab,
          season: selectedSeason ? parseInt(selectedSeason) : null,
          cloudinaryId: uploadResult.public_id
        });

        if (saveResponse.data.success) {
          // Update local state
          setImages([saveResponse.data.data, ...images]);
          toast.success('Image uploaded successfully!');
          setShowUploadModal(false);
          setSelectedFile(null);
          setSelectedSeason('');
        }
      } else {
        toast.error(uploadResult.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (imageId, cloudinaryId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      // Delete from MongoDB
      await axios.delete(`https://mpl-server-t9ib.onrender.com/api/gallery/${imageId}`);

      // Update local state
      setImages(images.filter(img => img._id !== imageId));
      toast.success('Image deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed. Please try again.');
    }
  };

  const filteredImages = images.filter(image => {
    // Filter by category
    if (activeTab !== 'all' && image.category !== activeTab) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !image.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by season if selected
    if (selectedSeason && image.season !== parseInt(selectedSeason)) {
      return false;
    }
    
    return true;
  });

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
            <span className="gradient-text">MPL Gallery</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Capturing the spirit, passion, and unforgettable moments of MPL through the seasons
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4">
        {/* Admin Controls */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-3xl p-6 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-display font-bold mb-2 flex items-center">
                  <FaCloudUploadAlt className="mr-3 text-mpl-accent" />
                  Gallery Management
                </h3>
                <p className="text-gray-400">Admin controls for uploading and managing images</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                <FaPlus />
                Upload New Image
              </button>
            </div>
          </motion.div>
        )}

        {/* Search and Filter Bar */}
        <div className="glass-morphism rounded-3xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl focus:outline-none focus:border-mpl-accent focus:ring-2 focus:ring-mpl-accent/20"
              />
            </div>

            {/* Season Filter */}
            <div className="flex items-center space-x-4">
              <FaFilter className="text-mpl-accent" />
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-4 py-3 bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl focus:outline-none focus:border-mpl-accent"
              >
                <option value="">All Seasons</option>
                {seasons.map(season => (
                  <option key={season} value={season}>Season {season}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-mpl-primary/50 hover:bg-mpl-primary'
                }`}
              >
                {category.icon}
                <span className="font-semibold">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="relative group"
                >
                  <div className="image-zoom-container rounded-2xl overflow-hidden border-2 border-mpl-accent/30 bg-gradient-to-br from-mpl-secondary to-mpl-primary">
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="w-full h-64 object-cover image-zoom"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="font-bold text-lg mb-1">{image.title}</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            {image.category} • {image.season ? `Season ${image.season}` : 'General'}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(image._id, image.cloudinaryId)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FaImages className="text-6xl text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2">No images found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedSeason 
                ? 'Try changing your search or filter criteria' 
                : isAdmin 
                  ? 'Upload your first image to get started!' 
                  : 'Check back later for new images'}
            </p>
            {isAdmin && !searchTerm && !selectedSeason && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-6 btn-primary"
              >
                <FaCloudUploadAlt />
                Upload First Image
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-morphism rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display font-bold">Upload Image</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Season Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Season (Optional)</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                  >
                    <option value="">No specific season</option>
                    {seasons.map(season => (
                      <option key={season} value={season}>Season {season}</option>
                    ))}
                  </select>
                </div>

                {/* File Upload Area */}
                <div
                  onClick={() => document.getElementById('file-upload').click()}
                  className="border-3 border-dashed border-mpl-accent/30 rounded-2xl p-8 text-center cursor-pointer hover:border-mpl-accent/50 transition-colors"
                >
                  {selectedFile ? (
                    <div>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl mx-auto mb-4"
                      />
                      <p className="text-sm text-gray-300">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="text-5xl text-gray-500 mx-auto mb-6" />
                      <h4 className="text-xl font-bold mb-3">Drop image or click to browse</h4>
                      <p className="text-gray-400 mb-6">Supports JPG, PNG, GIF (Max 5MB)</p>
                    </>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span>Uploading to Cloudinary...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-mpl-accent to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-6 py-3 rounded-xl bg-mpl-primary hover:bg-mpl-primary/80 transition-colors"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="btn-primary"
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? (
                      <>
                        <div className="loading-spinner w-5 h-5"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt />
                        Upload to Cloudinary
                      </>
                    )}
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

export default Gallery;