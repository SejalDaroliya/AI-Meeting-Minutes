import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  

  const [username, setUsername] = useState("User");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_URL;
  console.log("BASE_URL:", BASE_URL);
  const [isRecording, setIsRecording] = useState(false);

  // 🔥 NEW STATES
  const [stats, setStats] = useState({
    meetings: 0,
    minutes: 0,
    actions: 0,
    files: 0
  });

  const [recentMeetings, setRecentMeetings] = useState([]);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.name);

      // 🔥 FETCH DATA
      fetchStats(user.user_id);
      fetchMeetings(user.user_id);
    }
  }, []);

  // 🎤 MIC CLICK
  const handleMicClick = () => {
    setIsRecording((prev) => !prev);
  };

  // 🔥 FETCH STATS
  const fetchStats = async (userId) => {
    try {
      const res = await fetch(`${BASE_URL}/user-stats/${userId}`);
      const data = await res.json();
      setStats(data);
      console.log("STATS DATA:", data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  // 🔥 FETCH RECENT MEETINGS
  const fetchMeetings = async (userId) => {
    try {
      const res = await fetch(`${BASE_URL}/user-meetings/${userId}`);
      const data = await res.json();
      setRecentMeetings(data);
    } catch (err) {
      console.error("Meetings error:", err);
    }
  };

  // 🔥 API CALL
  const uploadAudio = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const user = JSON.parse(localStorage.getItem("user"));
    formData.append("user_id", user.user_id);

    const res = await fetch(`${BASE_URL}/process-audio`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json(); // ✅ STORE HERE

    console.log("Upload Result:", result); // 🔍 debug

    return result; // ✅ return full response
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <div className="navbar">
        <h2 className="logo">AI Meeting Minutes</h2>
        <button
          className="logout"
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-text">
          <h1>Welcome, {username} 👋</h1>
          <p>
            Upload meeting audio and let AI generate structured meeting minutes,
            summaries and key action items.
          </p>

          {/* Buttons */}
          <div className="hero-buttons">
            {/* Upload Button */}
            <label className="secondary-btn">
              Upload Meeting
              <input
                type="file"
                accept="audio/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </label>

            {/* Generate */}
            <button
              className="primary-btn"
              onClick={async () => {
                if (!selectedFile) {
                  alert("Please upload a meeting first");
                  return;
                }

                setLoading(true);

                try {
                  const result = await uploadAudio(selectedFile);

                  if (result && result.success) {
                    navigate("/summary", {
                      state: {
                        ...result,
                        meeting_id: result.meeting_id,
                      },
                    });
                  } else {
                    alert("Something went wrong");
                  }
                } catch (err) {
                  console.error(err);
                  alert("Server error");
                }

                setLoading(false);
              }}
            >
              {loading ? "Processing..." : "Generate Summary"}
            </button>

            {/* 🎤 MIC */}
            <button
              className={`mic-btn ${isRecording ? "recording" : ""}`}
              onClick={handleMicClick}
            >
              <div className="mic-icon"></div>
            </button>

          </div>

          {selectedFile && (
            <p className="file-name">📁 {selectedFile.name}</p>
          )}

          {isRecording && (
            <p className="recording-text">🎙️ Recording...</p>
          )}
        </div>

        {/* Illustration */}
        <div className="hero-illustration">
          <div className="circle big"></div>
          <div className="circle medium"></div>
          <div className="circle small"></div>
        </div>
      </div>

      {/* 🔥 DYNAMIC STATS */}
      <div className="stats-container">

        <div className="stat-card">
          <h3>{stats.meetings}</h3>
          <p>Meetings Uploaded</p>
        </div>

        <div className="stat-card">
          <h3>{stats.minutes}</h3>
          <p>Minutes Generated</p>
        </div>

        <div className="stat-card">
          <h3>{stats.actions}</h3>
          <p>Action Items</p>
        </div>

        <div className="stat-card">
          <h3>{stats.files}</h3>
          <p>Files Uploaded</p>
        </div>

      </div>

      {/* 🔥 DYNAMIC RECENT MEETINGS */}
      <div className="recent">
        <h2>Recent Meetings</h2>

        {recentMeetings.length === 0 ? (
          <p>No meetings yet</p>
        ) : (
          recentMeetings.map((meeting) => (
            <div className="meeting" key={meeting.meeting_id}>
              <span>{meeting.title}</span>
              <button
                onClick={() =>
                  navigate("/summary", { state: { meeting_id: meeting.meeting_id } })
                }
              >
                View
              </button>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Dashboard;
