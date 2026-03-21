import React from "react";
import "../STYLES/loginPage.css";

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="app-title">InternTrack</h1>
        <p className="tagline">Your Complete Internship Placement Platform</p>
      </header>

      <nav className="home-nav">
        <button className="nav-button">Dashboard</button>
        <button className="nav-button">Placements</button>
        <button className="nav-button">Companies</button>
        <button className="nav-button">Contact</button>
      </nav>

      <section className="hero-section">
        <h2>Welcome to InternTrack</h2>
        <p>Streamline your internship placement journey with our comprehensive platform designed for students, supervisors, and administrators.</p>
        <button className="cta-button">Get Started</button>
      </section>

      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📋 Application Tracking</h3>
            <p>Track your internship applications in real-time and get instant updates.</p>
          </div>
          <div className="feature-card">
            <h3>🏢 Company Database</h3>
            <p>Browse and apply to opportunities from leading companies.</p>
          </div>
          <div className="feature-card">
            <h3>👥 Mentor Connection</h3>
            <p>Connect with supervisors and mentors for guidance throughout your internship.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Analytics Dashboard</h3>
            <p>Monitor your progress and performance with detailed analytics.</p>
          </div>
        </div>
      </section>

      <section className="roles-section">
        <h2>Choose Your Role</h2>
        <div className="roles-grid">
          <div className="role-box">
            <h3>👨‍🎓 Student / Intern</h3>
            <p>Find and apply for internship opportunities</p>
            <button className="role-button">Login as Student</button>
          </div>
          <div className="role-box">
            <h3>👨‍💼 Supervisor</h3>
            <p>Manage internship programs and supervise students</p>
            <button className="role-button">Login as Supervisor</button>
          </div>
          <div className="role-box">
            <h3>🔐 Administrator</h3>
            <p>Oversee the entire platform and manage all users</p>
            <button className="role-button">Login as Admin</button>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>&copy; 2026 InternTrack. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
