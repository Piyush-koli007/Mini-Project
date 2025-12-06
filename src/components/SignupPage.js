// src/components/SignupPage.js
import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { storage } from '../firebase'; // Import storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage functions
import './AuthPage.css';

function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup } = useAuth(); 

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Document State (For NGOs)
  const [regCert, setRegCert] = useState(null);
  const [taxCert, setTaxCert] = useState(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Read role from URL
  const role = (searchParams.get('role') || 'donor').toLowerCase();
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  // Helper to upload a single file
  const uploadFile = async (file, path) => {
    if (!file) return null;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("--- 1. Handle submit started ---");

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    // Validation for NGO documents
    if (role === 'ngo' && (!regCert || !taxCert)) {
      return setError('Please upload both verification documents to proceed.');
    }

    try {
      setError('');
      setLoading(true);
      
      let additionalData = {};

      // If NGO, upload documents first
      if (role === 'ngo') {
        console.log("--- Uploading NGO Documents ---");
        const timestamp = Date.now();
        
        // Upload Registration Cert
        const regUrl = await uploadFile(regCert, `ngo_docs/${timestamp}_reg_${regCert.name}`);
        
        // Upload Tax Cert
        const taxUrl = await uploadFile(taxCert, `ngo_docs/${timestamp}_tax_${taxCert.name}`);

        additionalData = {
          documents: {
            registrationCertificate: regUrl,
            taxExemptionCertificate: taxUrl,
            verified: false // Defaults to false, Admin must approve
          }
        };
      }
      
      console.log("--- 2. Calling signup function... ---");
      await signup(email, password, fullName, role, additionalData);
      
      console.log("--- 3. Signup finished, navigating... ---");
      
      if (role === 'ngo') {
        navigate('/ngo-dashboard');
      } else if (role === 'beneficiary') {
        navigate('/beneficiary-dashboard');
      } else {
        navigate('/donor-dashboard');
      }

    } catch (err) {
      console.error("--- CATCH ERROR: ---", err);
      setError('Failed to create an account. ' + err.message);
    }
    setLoading(false);
  };

  // Determine theme class for animation/colors
  let themeClass = 'theme-donor';
  if (role === 'ngo') themeClass = 'theme-ngo';
  if (role === 'beneficiary') themeClass = 'theme-beneficiary';

  return (
    <div className={`auth-container ${themeClass}`} key={role}>
      <div className="auth-card">
        <div className="role-badge">Join SecureFund</div>
        
        <h1 className="auth-title">
          <span>{roleName}</span> Signup
        </h1>
        
        {role === 'ngo' ? (
          <p className="auth-subtitle" style={{color: '#34d399'}}>
            Identity verification required.
          </p>
        ) : (
          <p className="auth-subtitle">Create your account to get started.</p>
        )}
        
        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Full Name / Organization Name" 
            name="fullName"
            required 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            name="email"
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            name="password"
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            name="confirmPassword"
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* --- NGO DOCUMENTS SECTION --- */}
          {role === 'ngo' && (
            <div className="documents-section" style={{textAlign: 'left', marginTop: '1rem', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)'}}>
              <h4 style={{color: 'var(--text-main)', marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Legitimacy Verification</h4>
              
              <div style={{marginBottom: '10px'}}>
                <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px'}}>
                  Registration Certificate (PDF/JPG)
                </label>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  onChange={(e) => setRegCert(e.target.files[0])}
                  style={{padding: '8px', fontSize: '0.8rem'}} 
                />
              </div>

              <div>
                <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px'}}>
                  Tax Exemption / PAN Card
                </label>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  onChange={(e) => setTaxCert(e.target.files[0])}
                  style={{padding: '8px', fontSize: '0.8rem'}}
                />
              </div>
            </div>
          )}
          {/* --- END DOCUMENTS SECTION --- */}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Uploading & Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch-link">
          Already have an account? <Link to={`/login?role=${role}`}>Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;