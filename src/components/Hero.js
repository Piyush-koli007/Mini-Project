// src/components/Hero.js
import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero-section">
      {/* --- BACKGROUND VIDEO START --- */}
      <div className="video-background">
        <video autoPlay loop muted playsInline className="hero-video">
          {/* This is a placeholder abstract tech video. 
              You can replace this URL with a local file (e.g., src={require('../assets/video.mp4')}) */}
          <source 
            src="https://static.videezy.com/system/resources/previews/000/052/730/original/Abstract_3d_render_of_seamless_looped_animation.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
        {/* Overlay to darken the video so text pops */}
        <div className="video-overlay"></div>
      </div>
      {/* --- BACKGROUND VIDEO END --- */}

      <div className="hero-content">
        <h1 className="hero-title">Transparency in Every Transaction</h1>
        <p className="hero-subtitle">
          SecureFund uses blockchain to ensure every dollar for relief reaches the people who need it most. Unparalleled trust, visibility, and security.
        </p>
        <div className="hero-buttons">
          <a href="#features" className="btn btn-primary">How It Works</a>
          <a href="#contact" className="btn btn-secondary">Get In Touch</a>
        </div>
      </div>
    </section>
  );
}

export default Hero;