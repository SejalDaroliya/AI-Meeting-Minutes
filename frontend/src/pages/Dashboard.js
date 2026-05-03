import React, { useEffect, useState, useRef, useCallback } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
// import Reminder from "../components/Reminder";
import { useLoader } from "../context/LoaderContext";
import LiveMicModal from "../components/LiveRecording";

function Dashboard() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [username, setUsername] = useState("User");
  const [selectedFile, setSelectedFile] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // 🎤 Recording states
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const { showLoader, hideLoader } = useLoader();

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUsersPanel, setShowUsersPanel] = useState(false);

  const [showMicModal, setShowMicModal] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState([]);

  // ✅ username setup
      // 🔥 NEW STATES
  const [stats, setStats] = useState({
    meetings: 0,
    summaries: 0,
    actions: 0,
    avg_time: 0
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

const showToast = (message, type = "error") => {
  setToast({ show: true, message, type });
  setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
};
  


  // 🔥 COMMON UPLOAD FUNCTION
  const uploadAudio = async (file) => {
    if (!file) return showToast("No file found");

    const formData = new FormData();
    const fileName = meetingTitle || "recording";

    formData.append("file", file, `${fileName}.mp3`);
    formData.append("user_id", storedUser.user_id);
    formData.append("title", fileName);
    formData.append("participants", JSON.stringify(selectedUsers));

    const res = await fetch(`${BASE_URL}/process-audio`, {
      method: "POST",
      body: formData,
    });

    return await res.json();
  };

  // 🔥 FILE UPLOAD
  const handleGenerate = async () => {
  if (!meetingTitle.trim()) {
    showToast("Please enter a meeting title first");
    return;
  }

  if (!selectedFile) {
    showToast("Please upload a meeting first");
    return;
  }

  showLoader();

    try {
      const result = await uploadAudio(selectedFile);

      if (result.success) {
        navigate("/summary", { state: result });
      } else {
        showToast("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      showToast("Error generating summary");
    }

    hideLoader();
  };

  // 🔥 RECORDING UPLOAD
  const handleRecordingUpload = async () => {
    if (!audioBlob) {
      showToast("No recording found")
      return;
    }

    showLoader();

    try {
      const result = await uploadAudio(audioBlob);

      if (result.success) {
        navigate("/summary", { state: result });
      } else {
        showToast("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      showToast("Error processing recording");
    }

    hideLoader();
  };

  // 🎤 START RECORDING
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
      setAudioBlob(blob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  // ⏹ STOP
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // 👥 FETCH USERS
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/users`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.log(err);
    }
  }, [BASE_URL]);

  useEffect(() => {
    if (showUsersPanel) fetchUsers();
  }, [showUsersPanel, fetchUsers]);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  };
const fetchStats = useCallback(async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/user-stats/${userId}`);
    const data = await res.json();

    setStats({
    meetings: data.meetings || 0,
    summaries: data.summaries || 0,
    actions: data.actions || 0,
    avg_time: data.avg_time || 0,
    });
  } catch (err) {
    console.log("Stats error:", err);
  }
}, [BASE_URL]);

const fetchMeetings = useCallback(async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/recent-meetings/${userId}`);
    const data = await res.json();
    setRecentMeetings(data.meetings || []);
  } catch (err) {
    console.log("Meetings error:", err);
  }
}, [BASE_URL]);

useEffect(() => {
  const stored = localStorage.getItem("user");

  if (stored) {
    const user = JSON.parse(stored);
    setUsername(user.name);

    fetchStats(user.user_id);
    fetchMeetings(user.user_id);
  }
}, [fetchStats, fetchMeetings]);

  // 📊 FETCH RECENT MEETINGS
  const fetchRecentMeetings = useCallback(async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/recent-meetings/${storedUser.user_id}`
      );
      const data = await res.json();
      setRecentMeetings(data.meetings || []);
    } catch (err) {
      console.log(err);
    }
  }, [BASE_URL, storedUser?.user_id]);

  useEffect(() => {
    if (storedUser?.user_id) {
      fetchRecentMeetings();
    }
  }, [storedUser?.user_id, fetchRecentMeetings]);

  // 🎤 MIC CLICK
  const handleMicClick = () => {
  navigate("/live-recording");
};

  return (
    <div className="dashboard">

      {/* HERO */}
      <div className="hero">
        <div className="hero-text">
  <h1>Welcome back, <span className="hero-name">{username}</span> 👋</h1>
  <p className="hero-subtitle">
    Your meetings deserve more than scattered notes. MeetPilot AI does the heavy lifting — so you stay focused on what matters most.
  </p>
  <div className="hero-badges">
    <span className="badge">⚡ Instant Summaries</span>
    <span className="badge">✅ Action Items</span>
    <span className="badge">🎯 Key Decisions</span>
  </div>

  <input
    type="text"
    placeholder="Enter meeting title"
    value={meetingTitle}
    onChange={(e) => setMeetingTitle(e.target.value)}
    className="input"
  />

  <div className="hero-buttons">
    <label className="secondary-btn">
      Upload Meeting
      <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
    </label>

    <button onClick={handleMicClick} className="secondary-btn">
      🎤 Live Mic
    </button>

    <button className="tertiary-btn" onClick={() => setShowUsersPanel(!showUsersPanel)}>
      👥 Select Participants ({selectedUsers.length})
    </button>

    <button onClick={handleGenerate} className="primary-btn">
      Generate Summary
    </button>

    {showUsersPanel && (
      <div className="users-panel">
        <h3>Select Participants</h3>
        <div className="users-list">
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            users.map((user) => (
              <label key={user.user_id} className="user-item">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.user_id)}
                  onChange={() => toggleUser(user.user_id)}
                />
                <span>{user.name} ({user.email})</span>
              </label>
            ))
          )}
        </div>
        <button className="primary-btn" onClick={() => setShowUsersPanel(false)}>
          Done
        </button>
      </div>
    )}
  </div>

  {selectedFile && (
  <div className="file-preview">
    <span className="file-name">📁 {selectedFile.name}</span>
    <button className="file-remove-btn" onClick={() => setSelectedFile(null)}>✕</button>
  </div>
)}
  {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} />}
</div>

        {/* Illustration */}
        <div className="hero-illustration">
        <div className="right-panel-header">
  <img src="/logo.png" alt="MeetPilot AI" className="panel-logo" />
  <div>
    <h3 className="panel-title">MeetPilot AI</h3>
    <span className="panel-tag">AI Workflow Process</span>
  </div>
</div>

{/* HERO IMAGE */}
<img src="/hero_person.png" alt="workflow" className="panel-hero-img" />

<div className="panel-persona">
  <div className="persona-icon">📂</div>
  <div>
    <h4>Upload Meeting File</h4>
    <p>
      Add your recorded meeting audio or transcript file securely into the platform.
    </p>
  </div>
</div>

<div className="panel-persona">
  <div className="persona-icon">📝</div>
  <div>
    <h4>Transcript Generated</h4>
    <p>
      AI converts your meeting into structured, speaker-labeled text instantly.
    </p>
  </div>
</div>

<div className="panel-persona">
  <div className="persona-icon">🧠</div>
  <div>
    <h4>Summary + Insights</h4>
    <p>
      Key points, action items, and decisions are automatically extracted.
    </p>
  </div>
</div>

<div className="panel-persona">
  <div className="persona-icon">📑</div>
  <div>
    <h4>Final Report Ready</h4>
    <p>
      Receive a polished report for sharing, tracking, and future reference.
    </p>
  </div>
</div>

<div className="panel-footer">
  <span className="panel-stat">⚡ End-to-end automation</span>
  <span className="panel-dot"></span>
  <span className="panel-stat">🚀 Results in seconds</span>
</div>
       </div>
      </div>

      {/* 🔥 DYNAMIC STATS */}
<div className="stats-container">

  <div className="stat-card">
    <div className="stat-top">
      <span className="stat-icon">🎙️</span>
      <h3>{stats.meetings}</h3>
    </div>
    <p>Meetings Processed</p>
  </div>

  <div className="stat-card">
    <div className="stat-top">
      <span className="stat-icon">📝</span>
      <h3>{stats.summaries}</h3>
    </div>
    <p>Summaries Generated</p>
  </div>

  <div className="stat-card">
    <div className="stat-top">
      <span className="stat-icon">✅</span>
      <h3>{stats.actions}</h3>
    </div>
    <p>Action Items Extracted</p>
  </div>

  <div className="stat-card">
    <div className="stat-top">
      <span className="stat-icon">⚡</span>
      <h3>{stats.avg_time}s</h3>
    </div>
    <p>Avg Processing Time</p>
  </div>

</div>

      {/* 🔥 DYNAMIC RECENT MEETINGS */}
      <div className="recent-layout">
  {/* LEFT SIDE - RECENT MEETINGS */}
  <div className="recent">
  <div className="recent-header">
  <h2>Recent Meetings</h2>
  <button
    className="view-all-btn"
    onClick={() => navigate("/meetings")}
  >
    View All →
  </button>
</div>

    {recentMeetings.length === 0 ? (
  <div className="empty-state">
    <div className="empty-icon">🖥️</div>
    <h3>No meetings yet</h3>
    <p>
      Record or upload your first meeting and we'll generate
      a full summary in seconds.
    </p>
    <button
      className="empty-action-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      Start a Meeting
    </button>
  </div>
) : (
  recentMeetings.map((meeting) => (
    <div key={meeting.meeting_id} className="meeting">
      <div className="meeting-info">
        <div className="meeting-icon">🎙️</div>
        <div className="meeting-details">
          <span className="meeting-title">{meeting.title}</span>
          <span className="meeting-date">
            {new Date(meeting.date).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            })}
          </span>
        </div>
      </div>

      <button
        onClick={() =>
          navigate("/summary", {
            state: { meeting_id: meeting.meeting_id },
          })
        }
      >
        View
      </button>
    </div>
  ))
)}
  </div>

  {/* RIGHT SIDE - SIDEBAR */}
  <div className="insights-sidebar">
    <div className="insight-card">
      <div className="insight-icon">⏰</div>
      <div>
        <h2>Reminders</h2>
        <p>Stay on top of post-meeting commitments and deadlines.</p>
      </div>
      <button onClick={() => navigate("/reminders")}>
  View reminders
</button>
    </div>

    <div className="insight-card">
      <div className="insight-icon">📌</div>
      <div>
        <h2>Action Items</h2>
        <p>{stats.actions} tasks across all meetings tracked in one place.</p>
      </div>
      <button onClick={() => navigate("/actions")}>
  View all tasks
</button>
    </div>
  </div>
</div>

      {/* MODALS */}
      {showMicModal && (
        <LiveMicModal
          recording={recording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          handleRecordingUpload={handleRecordingUpload}
          audioBlob={audioBlob}
          onClose={() => setShowMicModal(false)}
        />
      )}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-icon">{toast.type === "error" ? "❌" : "✅"}</span>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}

export default Dashboard;