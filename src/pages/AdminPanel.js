import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCloudUploadAlt, 
  FaImage, 
  FaVideo, 
  FaCog,
  FaSignOutAlt,
  FaFolder,
  FaTachometerAlt,
  FaChartLine,
  FaUsers,
  FaHistory,
  FaTrash
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '../utils/cloudinary';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('gallery');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageTitle, setImageTitle] = useState('');
  const [imageCategory, setImageCategory] = useState('general');
  const [imageSeason, setImageSeason] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [stats, setStats] = useState({
    galleryCount: 0,
    winnersCount: 0,
    sponsorsCount: 0,
    uploadsToday: 0
  });

  useEffect(() => {
    fetchStats();
    if (activeTab === 'gallery') {
      fetchGalleryImages();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [galleryRes, winnersRes] = await Promise.all([
        axios.get('/api/gallery?limit=1'),
        axios.get('/api/winners')
      ]);

      setStats({
        galleryCount: galleryRes.data.data?.length || 0,
        winnersCount: winnersRes.data.data?.length || 0,
        sponsorsCount: 13, // Default sponsors
        uploadsToday: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await axios.get('/api/gallery?limit=20');
      if (response.data.success) {
        setGalleryImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const folders = [
    { id: 'gallery', name: 'Main Gallery', icon: <FaImage />, color: 'from-blue-500 to-cyan-500' },
    { id: 'winners', name: 'Winners Photos', icon: <FaFolder />, color: 'from-yellow-500 to-orange-500' },
    { id: 'matches', name: 'Match Photos', icon: <FaVideo />, color: 'from-green-500 to-emerald-500' },
    { id: 'sponsors', name: 'Sponsors', icon: <FaImage />, color: 'from-purple-500 to-pink-500' },
  ];

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'matches', label: 'Match Photos' },
    { id: 'winners', label: 'Winners' },
    { id: 'ceremony', label: 'Award Ceremony' },
    { id: 'teams', label: 'Team Photos' },
  ];

  const seasons = Array.from({ length: 13 }, (_, i) => i + 1);

  const adminStats = [
    { label: 'Gallery Images', value: stats.galleryCount, icon: <FaImage />, color: 'blue' },
    { label: 'Winners', value: stats.winnersCount, icon: <FaTachometerAlt />, color: 'yellow' },
    { label: 'Sponsors', value: stats.sponsorsCount, icon: <FaUsers />, color: 'green' },
    { label: 'Today\'s Uploads', value: stats.uploadsToday, icon: <FaChartLine />, color: 'purple' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

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
      if (!imageTitle) {
        setImageTitle(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      
      // Determine folder based on selection
      let folder = 'mpl/general';
      if (selectedFolder === 'winners') {
        folder = `mpl/winners`;
      } else if (selectedFolder === 'matches') {
        folder = `mpl/matches`;
      } else if (selectedFolder === 'sponsors') {
        folder = `mpl/sponsors`;
      } else {
        folder = `mpl/${imageCategory}`;
      }

      // Upload directly to Cloudinary
      const uploadResult = await uploadToCloudinary(selectedFile, folder);

      if (uploadResult.success) {
        // Save to MongoDB if it's for gallery
        if (selectedFolder === 'gallery') {
          const saveResponse = await axios.post('/api/gallery/add', {
            title: imageTitle,
            imageUrl: uploadResult.url,
            category: imageCategory,
            season: imageSeason ? parseInt(imageSeason) : null,
            cloudinaryId: uploadResult.public_id
          });

          if (saveResponse.data.success) {
            setGalleryImages([saveResponse.data.data, ...galleryImages]);
          }
        }

        toast.success('Image uploaded to Cloudinary successfully!');
        
        // Reset form
        setSelectedFile(null);
        setImageTitle('');
        setImageCategory('general');
        setImageSeason('');
        fetchStats();
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

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await axios.delete(`/api/gallery/${imageId}`);
      setGalleryImages(galleryImages.filter(img => img._id !== imageId));
      toast.success('Image deleted successfully!');
      fetchStats();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed. Please try again.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      if (!imageTitle) {
        setImageTitle(file.name.split('.')[0]);
      }
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-64"
          >
            <div className="glass-morphism rounded-3xl p-6 mb-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-mpl-accent to-emerald-500 rounded-full flex items-center justify-center">
                  <FaCog className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">MPL Admin</h2>
                  <p className="text-xs text-gray-400">Control Panel</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
                  { id: 'upload', label: 'Upload Media', icon: <FaCloudUploadAlt /> },
                  { id: 'gallery', label: 'Manage Gallery', icon: <FaImage /> },
                  { id: 'winners', label: 'Winners', icon: <FaHistory /> },
                  { id: 'sponsors', label: 'Sponsors', icon: <FaUsers /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-mpl-accent/20 to-emerald-500/20 text-mpl-accent border border-mpl-accent/30'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="w-full mt-8 flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 rounded-xl hover:from-red-500/30 hover:to-rose-500/30 transition-all border border-red-500/30"
              >
                <FaSignOutAlt />
                <span className="font-semibold">Logout</span>
              </button>
            </div>

            {/* Stats */}
            <div className="glass-morphism rounded-3xl p-6">
              <h3 className="font-display font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {adminStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`text-${stat.color}-400`}>{stat.icon}</div>
                      <span className="text-sm text-gray-400">{stat.label}</span>
                    </div>
                    <span className="font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Welcome Card */}
                <div className="glass-morphism rounded-3xl p-8">
                  <h3 className="text-3xl font-display font-bold mb-4">
                    Welcome to MPL Admin Panel
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Manage all aspects of the Marellavaripalem Premier League website from this control panel.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Upload Images', action: () => setActiveTab('upload'), color: 'blue' },
                      { label: 'Manage Gallery', action: () => setActiveTab('gallery'), color: 'green' },
                      { label: 'Update Winners', action: () => window.location.href = '/winners', color: 'yellow' },
                      { label: 'Edit Sponsors', action: () => window.location.href = '/sponsors', color: 'purple' },
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className={`p-4 rounded-2xl bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/10 border border-${item.color}-500/20 hover:border-${item.color}-500/40 transition-all`}
                      >
                        <span className="font-semibold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cloudinary Status */}
                <div className="glass-morphism rounded-3xl p-8">
                  <h4 className="text-xl font-display font-bold mb-4">Cloudinary Status</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Connected to Cloudinary</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Images are uploaded directly from browser to Cloudinary CDN
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'upload' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="glass-morphism rounded-3xl p-8">
                  <h3 className="text-3xl font-display font-bold mb-6 flex items-center">
                    <FaCloudUploadAlt className="mr-3 text-mpl-accent" />
                    Upload Media to Cloudinary
                  </h3>

                  {/* Destination Selection */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4">Select Destination</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => setSelectedFolder(folder.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                            selectedFolder === folder.id
                              ? `border-mpl-accent bg-gradient-to-br ${folder.color}/20`
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className={`text-3xl mb-2 bg-gradient-to-br ${folder.color} bg-clip-text text-transparent`}>
                            {folder.icon}
                          </div>
                          <span className="font-medium">{folder.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Details Form */}
                  {selectedFolder === 'gallery' && (
                    <div className="mb-8 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Image Title</label>
                        <input
                          type="text"
                          value={imageTitle}
                          onChange={(e) => setImageTitle(e.target.value)}
                          placeholder="Enter image title"
                          className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Category</label>
                          <select
                            value={imageCategory}
                            onChange={(e) => setImageCategory(e.target.value)}
                            className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Season (Optional)</label>
                          <select
                            value={imageSeason}
                            onChange={(e) => setImageSeason(e.target.value)}
                            className="w-full bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl p-3 focus:outline-none focus:border-mpl-accent"
                          >
                            <option value="">No specific season</option>
                            {seasons.map(season => (
                              <option key={season} value={season}>Season {season}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-4 border-dashed border-mpl-accent/30 rounded-3xl p-12 text-center mb-8 cursor-pointer hover:border-mpl-accent/50 transition-colors"
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-4">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="w-48 h-48 object-cover rounded-2xl mx-auto"
                        />
                        <div>
                          <p className="font-semibold">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="text-6xl text-gray-500 mx-auto mb-6" />
                        <h4 className="text-2xl font-bold mb-3">Drag & Drop or Click to Upload</h4>
                        <p className="text-gray-400 mb-6">Supports JPG, PNG, GIF (Max 5MB)</p>
                      </>
                    )}
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="mb-8">
                      <div className="flex justify-between mb-2">
                        <span>Uploading to Cloudinary...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-mpl-accent to-emerald-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4">
                    {selectedFile && (
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setImageTitle('');
                        }}
                        className="px-6 py-3 rounded-xl bg-mpl-primary hover:bg-mpl-primary/80 transition-colors"
                        disabled={uploading}
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={handleUpload}
                      className="btn-primary"
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? (
                        <>
                          <div className="loading-spinner w-5 h-5"></div>
                          Uploading to Cloudinary...
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
            )}

            {activeTab === 'gallery' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="glass-morphism rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-3xl font-display font-bold">Manage Gallery Images</h3>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="btn-secondary"
                    >
                      <FaCloudUploadAlt />
                      Upload New Image
                    </button>
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="text-center py-12">
                      <FaImage className="text-6xl text-gray-600 mx-auto mb-6" />
                      <p className="text-gray-400">No images in gallery yet</p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="mt-6 btn-primary"
                      >
                        Upload First Image
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {galleryImages.map((image) => (
                        <div
                          key={image._id}
                          className="bg-gradient-to-br from-mpl-secondary/50 to-transparent rounded-2xl p-4 border border-mpl-accent/20"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden mb-4">
                            <img
                              src={image.imageUrl}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold mb-1">{image.title}</h4>
                              <p className="text-sm text-gray-400">
                                {image.category} • {image.season ? `Season ${image.season}` : 'General'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteImage(image._id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-2"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;