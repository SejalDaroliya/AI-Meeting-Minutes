import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar({ meeting_id, user_name, onReminderClick }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="navbar">
      {/* LEFT SIDE */}
      <div className="nav-left">
        <h2 className="logo">
          <span>MeetPilot AI</span>
          <span className="logo">🤖</span>
        </h2>
        <p className="tagline">
          Transform conversations into smart summaries instantly.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        <div className="nav-links">
          <span onClick={() => navigate("/dashboard")}>Home</span>
          <span onClick={onReminderClick}>Reminders</span>
        </div>

        {/* PROFILE */}
        <div className="profile" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="avatar">{user_name?.charAt(0) || "U"}</div>

          {showDropdown && (
            <div className="dropdown">
              <div
                className="dropdown-item"
                onClick={() => {
                  navigate("/profile");
                  setShowDropdown(false); // closes dropdown
                }}
              >
                👤 Profile
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  navigate("/settings"); // or remove if not used
                  setShowDropdown(false);
                }}
              >
                ⚙️ Settings
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
