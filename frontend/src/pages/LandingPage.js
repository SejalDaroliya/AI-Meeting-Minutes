import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          AI Meeting Minutes
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <button className="start-btn" onClick={() => navigate("/login")}>Get Started</button>
        </div>

      </nav>



      {/* HERO SECTION */}

      <section className="meethero">

        <div className="meethero-content">

          <div className="meethero-text">

            <h1>
              Turn Meetings Into <span>Smart AI Minutes</span>
            </h1>

            <p>
              Automatically convert meeting transcripts into structured
              summaries, key action items and shareable notes using AI.
            </p>

            <button className="meethero-btn" onClick={() => navigate("/login")}>
              Start Generating Minutes
            </button>

          </div>


          {/* AI Illustration */}

          <div className="hero-illustration">

            <svg width="320" height="320" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="#d8b4fe" opacity="0.35"/>
              <circle cx="100" cy="100" r="55" fill="#c084fc" opacity="0.5"/>
              <circle cx="100" cy="100" r="30" fill="#7c3aed"/>
            </svg>

          </div>

        </div>

      </section>



      {/* FEATURES */}

      <section className="features" id="features">

        <h2>Features</h2>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="icon">🎙️</div>
            <h3>AI Transcription</h3>
            <p>Convert meeting audio into readable text instantly.</p>
          </div>

          <div className="feature-card">
            <div className="icon">🧠</div>
            <h3>Automatic Meeting Summary</h3>
            <p>AI extracts the most important points from discussions.</p>
          </div>

          <div className="feature-card">
            <div className="icon">📌</div>
            <h3>Key Action Items</h3>
            <p>Automatically detect tasks, decisions and responsibilities.</p>
          </div>

          <div className="feature-card">
            <div className="icon">📤</div>
            <h3>Shareable Notes</h3>
            <p>Share organized meeting minutes with your entire team.</p>
          </div>

        </div>

      </section>



      {/* FOOTER */}

      <footer className="footer">

        <h3>AI Meeting Minutes</h3>

        <p>Final Year Project – AI & Data Science</p>

        <div className="team">

          <h4>Team Members</h4>

          <p>• Sejal Daroliya</p>
          <p>• Shraddha Mehra</p>
          <p>• Udai Pratap Singh Jhala</p>
          <p>• Yashi Sharma</p>
          <p>• Vishal Tank</p>

        </div>

      </footer>

    </div>
  );
}

export default LandingPage;