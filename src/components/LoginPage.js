// src/components/LoginPage.js
import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion'; // <--- IMPORT THIS
import './AuthPage.css';

function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get role from URL, default to 'donor'
  const role = (searchParams.get('role') || 'donor').toLowerCase();
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  // Helper to switch roles smoothly
  const switchRole = (newRole) => {
    navigate(`/login?role=${newRole.toLowerCase()}`);
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const authUser = await login(email, password);
      
      const userRef = doc(db, 'users', authUser.user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const userRole = userData.role.toLowerCase();
        
        if (userRole !== role) {
          setError(`⚠️ Access Denied: You are a ${userRole}, not a ${role}.`);
          setLoading(false);
          return;
        }

        if (userRole === 'ngo') navigate('/ngo-dashboard');
        else if (userRole === 'beneficiary') navigate('/beneficiary-dashboard');
        else if (userRole === 'pendingngo') navigate('/ngo-dashboard');
        else navigate('/donor-dashboard');

      } else {
        setError('User data not found.');
      }
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
    }
    setLoading(false);
  };

  // Define colors based on role for the "Gen Z" neon vibe
  const getRoleColor = () => {
    if (role === 'ngo') return '#10b981'; // Emerald
    if (role === 'beneficiary') return '#f43f5e'; // Rose
    return '#8b5cf6'; // Violet (Donor)
  };

  return (
    <div className="auth-container">
      <AnimatePresence mode='wait'>
        <motion.div 
          key={role} // <--- Key triggers animation when role changes
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
          className="auth-card"
          style={{ borderColor: getRoleColor(), boxShadow: `0 0 20px ${getRoleColor()}40` }} // Dynamic neon glow
        >
          {/* --- ROLE SELECTOR TABS --- */}
          <div className="role-selector">
            {['Donor', 'NGO', 'Beneficiary'].map((r) => (
              <button 
                key={r} 
                className={role === r.toLowerCase() ? 'active' : ''} 
                onClick={() => switchRole(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* --- ANIMATED ROLE INDICATOR --- */}
          <motion.div 
            className="role-badge-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.1 }}
          >
            <span className="role-badge" style={{ backgroundColor: getRoleColor() }}>
              {roleName} Portal
            </span>
            <p className="auth-subtitle" style={{marginTop: '10px'}}>
              Accessing secure gateway for <strong style={{color: getRoleColor()}}>{roleName}s</strong>.
            </p>
          </motion.div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="auth-error"
            >
              {error}
            </motion.p>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="auth-submit-btn" 
              disabled={loading}
              style={{ background: getRoleColor() }}
            >
              {loading ? 'Authenticating...' : `Log In as ${roleName}`}
            </motion.button>
          </form>

          <p className="auth-switch-link">
            New here? <Link to={`/signup?role=${role}`} style={{color: getRoleColor()}}>Create {roleName} Account</Link>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default LoginPage;