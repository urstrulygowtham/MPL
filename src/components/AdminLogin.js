import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaSignInAlt, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminLogin = ({ setIsAdmin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://mpl-server-t9ib.onrender.com/api/admin/login', { password });
      
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        setIsAdmin(true);
        toast.success('Login successful!');
        navigate('/admin');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-morphism rounded-3xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-mpl-accent to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-mpl-accent/20"
          >
            <FaLock className="text-3xl text-white" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold mb-2">Admin Portal</h2>
          <p className="text-gray-400">Enter password to access admin panel</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <FaShieldAlt className="text-mpl-accent" />
            <span className="text-sm text-gray-500">Access: /admin</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Admin Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-mpl-primary/50 border border-mpl-accent/20 rounded-xl focus:outline-none focus:border-mpl-accent focus:ring-2 focus:ring-mpl-accent/20"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? (
              <>
                <div className="loading-spinner w-5 h-5"></div>
                Authenticating...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Login to Admin Panel
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-mpl-primary/50 px-4 py-2 rounded-xl">
            <FaLock className="text-mpl-accent" />
            <span>Restricted Access • Authorized Personnel Only</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;