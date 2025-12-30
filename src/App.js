import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Winners from './components/Winners';
import Gallery from './components/Gallery';
import Sponsors from './components/Sponsors';
import Contact from './components/Contact';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './pages/AdminPanel';

import './index.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const location = useLocation();

  /* ===========================
     Verify Admin Token
  =========================== */
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await axios.get('/api/admin/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.success) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        setIsAdmin(false);
        localStorage.removeItem('adminToken');
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAdmin();
  }, [location]);

  /* ===========================
     Loader while checking auth
  =========================== */
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mpl-dark text-white">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mpl-dark via-mpl-primary to-mpl-secondary">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#112240',
            color: '#fff',
            border: '1px solid #64ffda'
          }
        }}
      />

      {/* Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              left: `${Math.random() * 100}vw`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 20 + 10}s`,
            }}
          />
        ))}
      </div>

      <Header />

      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/winners" element={<Winners />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/admin/login"
            element={
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <AdminLogin setIsAdmin={setIsAdmin} />
              )
            }
          />

          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminPanel />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
