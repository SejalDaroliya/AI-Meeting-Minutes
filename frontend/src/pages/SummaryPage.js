import "../styles/SummaryPage.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Reminder from "../components/Reminder";
import { useLoader } from "../context/LoaderContext";

function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const meetingId = location.state?.meeting_id;
  const hasTranscript = location.state?.transcript;

  const [data, setData] = useState(location.state || null);

  const { showLoader, hideLoader } = useLoader();

  const [activeTab, setActiveTab] = useState("summary");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showReminder, setShowReminder] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // extract data safely
  const keyPoints = data?.key_points || [];
  const actions = data?.action_items || [];
  const decisions = data?.decisions || [];
  const insight = data?.insight || "";
  const timeTaken = data?.processing_time || null;

  const meetingTitle =
    data?.title?.trim() ||
    data?.meeting_title?.trim() ||
    "Untitled Meeting";

  const meetingDate = data?.date || data?.created_at || null;

  // LOAD VOICES
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      const defaultVoice =
        allVoices.find(v => v.name.toLowerCase().includes("female")) ||
        allVoices.find(v => v.name.toLowerCase().includes("zira")) ||
        allVoices[0];

      setSelectedVoice(defaultVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // FETCH SUMMARY
  useEffect(() => {
    const fetchSummary = async () => {
      if (!meetingId) return;

      showLoader();

      try {
        const res = await fetch(`${BASE_URL}/meeting-summary/${meetingId}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to fetch summary");
        }

        setData(result);
      } catch (err) {
        console.error(err);
        alert("Error loading summary");
      }

      hideLoader();
    };

    if (!hasTranscript && meetingId) {
      fetchSummary();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, BASE_URL, hasTranscript]);

  // SPEAK FUNCTION
  const speakText = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = speechRate;
    speech.pitch = 1;
    speech.lang = "en-US";

    if (selectedVoice) speech.voice = selectedVoice;

    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // CLEANUP
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // FORMAT DATE
  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="summary-page">

      {/* BACK */}
      <div className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Meetings
      </div>

      {/* HEADER */}
      <div className="meeting-header">
        <h2 className="meeting-title">{meetingTitle}</h2>

        <div className="glass insight-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>✨ AI SUMMARY</h2>

            {!isSpeaking ? (
              <button onClick={() => speakText(insight)}>🔊 Read</button>
            ) : (
              <button onClick={stopSpeech}>⏹ Stop</button>
            )}
          </div>
        </div>

        {timeTaken && (
          <p className="time-box">⏱ Processed in {timeTaken}s</p>
        )}

        {meetingDate && (
          <p className="meeting-meta">
            {formatDateTime(meetingDate)} • Live recording
          </p>
        )}
      </div>

      {/* TABS */}
      <div className="tabs-container">
        {["summary", "actions", "report"].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? "active tab-item" : "tab-item"}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="tab-content">

        {/* SUMMARY */}
        {activeTab === "summary" && (
          <div className="card">
            <h3>Summary</h3>
            <p>{insight || "No summary available"}</p>

            <h4>Key Points</h4>
            <ul>{keyPoints.map((i, idx) => <li key={idx}>{i}</li>)}</ul>

            <h4>Decisions</h4>
            <ul>{decisions.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
          </div>
        )}

        {/* ACTIONS */}
        {activeTab === "actions" && (
          <div className="card">
            <h3>Action Items</h3>
            <ul>{actions.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
          </div>
        )}

        {/* REPORT */}
        {activeTab === "report" && (
          <div className="card">
            <button
              onClick={() =>
                navigate("/share-report", {
                  state: { meeting_id: data?.meeting_id },
                })
              }
            >
              Share Notes
            </button>
          </div>
        )}
      </div>

      {/* REMINDER */}
      {showReminder && (
        <Reminder
          meetingId={data?.meeting_id}
          userId={storedUser?.user_id}
          onClose={() => setShowReminder(false)}
        />
      )}

    </div>
  );
}

export default SummaryPage;