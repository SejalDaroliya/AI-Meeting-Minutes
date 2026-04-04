import React from "react";
import "../styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/login", {
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
    <h1>MeetPilotAI</h1>
    <p>Generate smart meeting summaries using AI 🚀</p>
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