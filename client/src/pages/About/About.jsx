import React from 'react';
import './AboutUs.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-card">
        <div className="about-header">
          <h1>About Our E-Voting System</h1>
        </div>
        <div className="about-content">
          <p>
            Our platform aims to provide a secure and transparent voting experience using advanced technologies like
            blockchain, face verification, and Ethereum smart contracts. With a user-friendly interface, voters can easily
            cast their votes while ensuring the highest level of security and integrity in the election process.
          </p>
          <div className="features">
            <h2>Key Features</h2>
            <ul>
              <li>Face Verification</li>
              <li>Blockchain-based Voting</li>
              <li>Real-time Vote Tracking</li>
              <li>Secure Admin Dashboard</li>
              <li>Role-based Access Control</li>
            </ul>
          </div>
        </div>
        <footer className="about-footer">
          <p>&copy; 2025 E-Voting System | Designed and Developed by Momina Rashad & Hadia Moosa</p>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;
