import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { useLoader } from "../context/LoaderContext";

function Navbar({ meeting_id, user_name }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const navigateWithLoader = (path) => {
  showLoader();

  setTimeout(() => {
    navigate(path);
    hideLoader();
  }, 200);
};

  return (
    <div className="navbar">
      {/* LEFT SIDE */}
      <div className="nav-left">
        <div className="logo-wrapper" onClick={() => navigateWithLoader("/dashboard")}>
          <img src="/logo.png" alt="logo" className="logo-img" />
          <span className="logo-text">
            MeetPilot <span className="logo-ai">AI</span>
          </span>
        </div>
        <p className="tagline">
          Transform conversations into smart summaries instantly.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        <div className="nav-links">
          <span onClick={() => navigateWithLoader("/dashboard")}>Home</span>
          <span onClick={() => navigate("/meetings")}>Meetings</span>
          <span onClick={() => navigateWithLoader("/live-recording")}>Record/Upload</span>
          <span onClick={() => navigate("/reminders")}>Reminders</span>
          <span onClick={() => navigate("/actions")}>Action Items</span>
        </div>

        {/* PROFILE */}
        <div
          className="profile"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="avatar">{user_name?.charAt(0) || "U"}</div>

          {showDropdown && (
            <div className="dropdown">
              <div
                className="dropdown-item"
                onClick={() => {
                  navigate("/profile");
                  setShowDropdown(false);
                }}
              >
                👤 Profile
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