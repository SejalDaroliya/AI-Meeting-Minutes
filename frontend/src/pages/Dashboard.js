import React, { useEffect, useState, useRef, useCallback } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import Reminder from "../components/Reminder";
import { useLoader } from "../context/LoaderContext";
import LiveMicModal from "../components/LiveMicModal";

function Dashboard() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [username, setUsername] = useState("User");
  const [selectedFile, setSelectedFile] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState("");

  const [showReminder, setShowReminder] = useState(false);
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
    minutes: 0,
    actions: 0,
    files: 0
  });

  


  // 🔥 COMMON UPLOAD FUNCTION
  const uploadAudio = async (file) => {
    if (!file) return alert("No file found");

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
    if (!selectedFile) {
      alert("Please upload a meeting first");
      return;
    }

    showLoader();

    try {
      const result = await uploadAudio(selectedFile);

      if (result.success) {
        navigate("/summary", { state: result });
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating summary");
    }

    hideLoader();
  };

  // 🔥 RECORDING UPLOAD
  const handleRecordingUpload = async () => {
    if (!audioBlob) {
      alert("No recording found");
      return;
    }

    showLoader();

    try {
      const result = await uploadAudio(audioBlob);

      if (result.success) {
        navigate("/summary", { state: result });
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing recording");
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
      minutes: data.minutes || 0,
      actions: data.actions || 0,
      files: data.files || 0,
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
    setShowMicModal(true);
  };

  return (
    <div className="dashboard">

      {/* HERO */}
      <div className="hero">
        <div className="hero-text">
          <h1>Welcome, {username} 👋</h1>

          <p>
            Upload or record meetings and generate AI-powered summaries,
            key points, and action items.
          </p>

          {/* 🆕 Meeting Title */}
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
              <input
                type="file"
                hidden
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </label>

            <button onClick={handleMicClick} className="secondary-btn">
              🎤 Live Mic
            </button>

            <button onClick={handleGenerate} className="primary-btn">
              Generate Summary
            </button>

            <button
              className="secondary-btn"
              onClick={() => setShowUsersPanel(!showUsersPanel)}
            >
              👥 Select Participants ({selectedUsers.length})
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
                        <span>
                          {user.name} ({user.email})
                        </span>
                      </label>
                    ))
                  )}
                </div>

                <button
                  className="primary-btn"
                  onClick={() => setShowUsersPanel(false)}
                >
                  Done
                </button>

              </div>
            )}

          </div>

          {/* Selected file */}
          {selectedFile && (
            <p className="file-name">📁 {selectedFile.name}</p>
          )}

          {/* 🎧 Preview recording */}
          {audioBlob && (
            <audio controls src={URL.createObjectURL(audioBlob)} />
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
  <p>No recent meetings</p>
) : (
  recentMeetings.map((meeting) => (
    <div key={meeting.meeting_id} className="meeting">
      <span>
        {meeting.title} <br />
        <small style={{ color: "#666" }}>
          {new Date(meeting.date).toLocaleString()}
        </small>
      </span>

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

      {showReminder && (
        <Reminder
          meetingId={null}
          userId={storedUser?.user_id}
          onClose={() => setShowReminder(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;