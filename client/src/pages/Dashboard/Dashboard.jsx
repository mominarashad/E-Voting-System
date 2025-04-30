import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleProtectedRoute = (path) => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(path); // token exists --> allow navigation
    } else {
      alert('🚫 Please login first to access this page.');
      navigate('/login'); // no token --> force to login
    }
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🗳️ E-Voting</div>
        <ul className="nav-links">
          <li><Link to="/signup"><i className="fas fa-user-plus"></i> Sign Up</Link></li>
          <li><Link to="/login"><i className="fas fa-sign-in-alt"></i> Login</Link></li>
          <li>
            <button className="nav-button" onClick={() => handleProtectedRoute('/candidates')}>
              <i className="fas fa-vote-yea"></i> Candidates
            </button>
          </li>
          <li>
            <button className="nav-button" onClick={() => handleProtectedRoute('/contact')}>
              <i className="fas fa-poll"></i> Contact Us
            </button>
          </li>
          <li>
            <button className="nav-button" onClick={() => handleProtectedRoute('/about')}>
              <i className="fas fa-poll"></i> About Us
            </button>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome to Electronic Voting System</h1>
        <p>Secure, Transparent, and Fast Elections powered by Blockchain & AI</p>
        <Link to="/signup" className="btn">Get Started</Link>
      </section>

      {/* How it Works */}
      <section className="info-section">
        <h2>🔍 How It Works</h2>
        <div className="info-cards">
          <div className="card">
            <i className="fas fa-user-check fa-2x"></i>
            <h3>1. Secure Sign Up</h3>
            <p>Register securely with facial verification and unique ID.</p>
          </div>
          <div className="card">
            <i className="fas fa-face-smile-wink fa-2x"></i>
            <h3>2. Face Login</h3>
            <p>Login instantly using advanced biometric face recognition.</p>
          </div>
          <div className="card">
            <i className="fas fa-lock fa-2x"></i>
            <h3>3. Cast Your Vote</h3>
            <p>Vote anonymously and securely with blockchain storage.</p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="info-section dark-section">
        <h2>🚀 Key Features</h2>
        <div className="info-cards">
          <div className="card">
            <i className="fas fa-shield-alt fa-2x"></i>
            <h3>Blockchain Security</h3>
            <p>Immutable records of every vote ensuring trust & transparency.</p>
          </div>
          <div className="card">
            <i className="fas fa-fingerprint fa-2x"></i>
            <h3>Biometric Authentication</h3>
            <p>Advanced face recognition ensures voter authenticity.</p>
          </div>
          <div className="card">
            <i className="fas fa-clock fa-2x"></i>
            <h3>Real-Time Results</h3>
            <p>Instant vote counting with zero manual error possibility.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
