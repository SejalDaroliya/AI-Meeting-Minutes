import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/SignUpPage.css";
import { toast } from "react-toastify";

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleSignup = async (e) => {
  e.preventDefault();

  // Insert directly into your table
  const { data, error } = await supabase.from("users").insert([
    {
      name: name,
      email: email,
      password_hash: password, // ⚠️ plain text for now
    },
  ]);

  if (error) {
    toast.error(error.message);
  } else {
    toast.success("Signup successful 🎉");
    navigate("/login");
  }
};
  return (

    <div className="signup-container">
        <div className="signup-left">
    <h1>Join MeetPilotAI</h1>
    <p>Start generating AI-powered meeting insights</p>
  </div>

  <div className="signup-right">
    <div className="signup-card">


        <form className="signup-form" onSubmit={handleSignup}>

          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Sign Up</button>

        </form>

        <p className="login-text">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>

      </div>
    </div>
    </div>
  );
}

export default SignupPage;