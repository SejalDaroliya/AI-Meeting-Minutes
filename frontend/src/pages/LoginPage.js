import React from "react";
import "../styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const BASE_URL = process.env.REACT_APP_API_URL;

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message || "Login failed");
      return;
    }

    // ✅ store user
    localStorage.setItem("user", JSON.stringify(data.user));

    toast.success("Login successful 🚀");
    navigate("/dashboard");

  } catch (err) {
    toast.error("Server error");
  }
};
  return (
    <div className="login-container">
      <div className="login-left">
    <div className="login-brand">
  <div className="login-brand-content">
    <div className="login-brand-logo">
      <div className="login-brand-logo-icon">&#10022;</div>
      MeetPilotAI
    </div>
    <h1>Your meetings,<br />intelligently managed.</h1>
    <p>Record, transcribe, and extract actionable insights from every meeting — automatically. Let AI handle the notes so you can stay in the conversation.</p>
    <div className="login-features">
      <div className="login-feature">
        <div className="login-feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <span>Real-time transcription with speaker detection</span>
      </div>
      <div className="login-feature">
        <div className="login-feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <span>AI-generated summaries, reports, and action items</span>
      </div>
      <div className="login-feature">
        <div className="login-feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <span>Cross-meeting task tracking and smart reminders</span>
      </div>
    </div>
  </div>
</div>
  </div>

  <div className="login-right">
    <div className="login-card">

        <form className="login-form" onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        <p className="signup-text">
          Don't have an account?
          <span onClick={() => navigate("/signup")}> Sign up</span>
        </p>
      </div>
    </div>
    </div>
  );
}

export default LoginPage;