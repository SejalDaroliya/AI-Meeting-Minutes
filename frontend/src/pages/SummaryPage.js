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

  // ✅ DATA
  const data = location.state || {};

  const keyPoints = data.key_points || [];
  const actions = data.action_items || [];
  const decisions = data.decisions || [];
  const insight = data.insight || "";
  const timeTaken = data.processing_time || null;

  const meetingTitle =
    data?.title?.trim() ||
    data?.meeting_title?.trim() ||
    "Untitled Meeting";

  const meetingDate = data.date || data.created_at || null;

  const [activeTab, setActiveTab] = useState("summary");

  // 🔊 VOICE STATES
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // 🎙 LOAD VOICES
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      const female =
        allVoices.find(v => v.name.toLowerCase().includes("female")) ||
        allVoices.find(v => v.name.toLowerCase().includes("zira")) ||
        allVoices[0];

      setSelectedVoice(female);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // 🔊 SPEAK FUNCTION
  const speakText = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = speechRate;
    speech.pitch = 1;
    speech.lang = "en-US";

    if (selectedVoice) speech.voice = selectedVoice;

    speech.onend = () => setIsSpeaking(false);

    setIsSpeaking(true);
  const [data, setData] = useState(location.state || null);

  const { showLoader, hideLoader } = useLoader();

  const keyPoints = data?.key_points || [];
  const actions = data?.action_items || [];
  const decisions = data?.decisions || [];
  const insight = data?.insight || "";
  const timeTaken = data?.processing_time || null;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // ✅ IMPORTANT: extract primitive dependency
  const hasTranscript = location.state?.transcript;

  // ✅ CLEAN useEffect (no warnings, no loop)
  useEffect(() => {
  const fetchSummary = async () => {
    if (!meetingId) return;

    showLoader();

    try {
      const res = await fetch(
        `${BASE_URL}/meeting-summary/${meetingId}`
      );

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

  // ❗️IMPORTANT: disable lint for this line
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [meetingId, BASE_URL, hasTranscript]);
  // 🔊 READ ALOUD
  const speakText = () => {
    if (!data) return;

    const text = `
      Summary: ${insight}
      Key Points: ${keyPoints.join(", ")}
      Action Items: ${actions.join(", ")}
      Decisions: ${decisions.join(", ")}
    `;

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // 📅 FORMAT DATE
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
    <div className="meeting-page">

      {/* 🔙 BACK */}
      <div className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Meetings
      </div>

      {/* 🧾 HEADER */}
      <div className="meeting-header">
        <h2 className="meeting-title">{meetingTitle}</h2>
  // cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="summary-page">

      {/* TIME */}
      {timeTaken && (
        <div className="time-box">
          ⏱ Processed in {timeTaken} seconds
        </div>
      )}

      {/* AI SUMMARY */}
      <div className="glass insight-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>✨ AI SUMMARY</h2>

          {!isSpeaking ? (
            <button className="primary-btn" onClick={speakText}>
              🔊 Read Aloud
            </button>
          ) : (
            <button className="primary-btn" onClick={stopSpeech}>
              ⏹ Stop
            </button>
          )}
        </div>

        {timeTaken && (
          <p className="time">⏱ Processed in {timeTaken}s</p>
        )}
      </div>

      {/* 📅 DATE */}
      {meetingDate && (
        <p className="meeting-meta">
          {formatDateTime(meetingDate)} • Live recording
        </p>
      )}

      {/* 🌟 TABS */}
      <div className="tabs-container">
        <button
          className={`tab-item ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>

        <button
          className={`tab-item ${activeTab === "actions" ? "active" : ""}`}
          onClick={() => setActiveTab("actions")}
        >
          Action Items
        </button>

        <button
          className={`tab-item ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          Report
        </button>
      </div>

      {/* 📦 CONTENT */}
      <div className="tab-content">

        {/* 🟣 SUMMARY */}
        {activeTab === "summary" && (
          <>
            <div className="card highlight">

              <div className="summary-header">

                <h3 className="section-title">Summary</h3>

                <div className="voice-controls">

                  {/* 🔊 READ / STOP */}
                  {!isSpeaking ? (
                    <button
                      className="speak-btn"
                      onClick={() => speakText(insight)}
                    >
                      🔊 Read
                    </button>
                  ) : (
                    <button className="stop-btn" onClick={stopSpeech}>
                      ⏹ Stop
                    </button>
                  )}

                  {/* ⚡ SPEED */}
                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="control-select"
                  >
                    <option value={1}>⚡ 1x</option>
                    <option value={1.5}>⚡ 1.5x</option>
                    <option value={2}>⚡ 2x</option>
                  </select>

                  {/* 🎙 VOICE */}
                  <select
                    onChange={(e) =>
                      setSelectedVoice(
                        voices.find(v => v.name === e.target.value)
                      )
                    }
                    className="control-select"
                  >
                    {voices.map((voice, i) => (
                      <option key={i} value={voice.name}>
                        🎙 {voice.name}
                      </option>
                    ))}
                  </select>

                </div>
              </div>

              <p>{insight || "No summary available"}</p>
            </div>

            <div className="grid">
              <div className="card accent-blue">
                <h3 className="section-title">Key Points</h3>
                {keyPoints.length > 0 ? (
                  <ul>
                    {keyPoints.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No key points</p>
                )}
              </div>

              <div className="card accent-pink">
                <h3 className="section-title">Decisions</h3>
                {decisions.length > 0 ? (
                  <ul>
                    {decisions.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No decisions</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ✅ ACTION ITEMS */}
        {activeTab === "actions" && (
          <div className="card accent-green">
            <h3 className="section-title">Action Items</h3>
            {actions.length > 0 ? (
              <ul>
                {actions.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            ) : (
              <p>No action items</p>
            )}
          </div>
        )}

        {/* 📤 REPORT */}
        {activeTab === "report" && (
          <div className="card">
            <h3 className="section-title">Report</h3>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/share-report", {
                  state: { meeting_id: data.meeting_id },
                })
              }
            >
              Share Notes
            </button>
          </div>
        )}
      </div>

      {/* Reminder */}
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
