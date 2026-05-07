import "../styles/SummaryPage.css";
import HeroVisual from "./HeroVisual";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoader } from "../context/LoaderContext";

function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const meetingId = location.state?.meeting_id;

  const [data, setData] = useState(null);
  const { showLoader, hideLoader } = useLoader();

  const [activeTab, setActiveTab] = useState("summary");

  // 🔊 VOICE
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const voicesRef = useRef([]);
  const selectedVoiceRef = useRef(null);

  const keyPoints = data?.key_points || [];
  const actions = data?.action_items || [];
  const decisions =
    typeof data?.decisions === "string"
      ? JSON.parse(data.decisions)
      : data?.decisions || [];
  const insight = data?.insight || data?.summary || "";
  const timeTaken = data?.processing_time || null;
  const meetingTitle = data?.title || "Untitled Meeting";
  const meetingDate = data?.date || data?.created_at || null;
  const [trackedActions, setTrackedActions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);


  // ✅ LOAD VOICES
  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const v = synth.getVoices();
      if (!v.length) { setTimeout(loadVoices, 200); return; }
      voicesRef.current = v;
      const englishVoice = v.find((vx) => vx.lang.startsWith("en")) || v[0];
      setVoices(v);
      setSelectedVoice(englishVoice);
      selectedVoiceRef.current = englishVoice;
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    return () => { synth.onvoiceschanged = null; };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => {
  //   const fetchSummary = async () => {
  //     if (!meetingId) return;
  //     showLoader();
  //     try {
  //       const res = await fetch(`${BASE_URL}/meeting-summary/${meetingId}`);
  //       const result = await res.json();
  //       if (!res.ok) throw new Error(result.error);
  //       setData(result);
  //     } catch (err) {
  //       console.error(err);
  //       alert("Error loading summary");
  //     } finally {
  //       hideLoader();
  //     }
  //   };
  //   fetchSummary();
  // }, [meetingId, BASE_URL, showLoader, hideLoader]);


  // 🔊 SPEAK
  const speakText = () => {
    const synth = window.speechSynthesis;
    const fullText = [
      insight ? `Summary: ${insight}.` : "",
      keyPoints.length ? `Key Points: ${keyPoints.join(". ")}.` : "",
      decisions.length ? `Decisions: ${decisions.join(". ")}.` : "",
    ].filter(Boolean).join(" ");

    if (!fullText.trim()) { alert("No content to read."); return; }

    const attemptSpeak = (attempts = 0) => {
      const availableVoices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
      if (!availableVoices.length && attempts < 10) { setTimeout(() => attemptSpeak(attempts + 1), 300); return; }
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = speechRate;
      utterance.voice =
        selectedVoiceRef.current ||
        availableVoices.find((v) => v.lang.startsWith("en")) ||
        availableVoices[0] || null;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => { console.error("Speech error:", e); setIsSpeaking(false); };
      synth.speak(utterance);
    };
    attemptSpeak();
  };

  const stopSpeech = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  };

// ✅ FETCH TRACKED ACTIONS
const fetchTrackedActions = useCallback(async () => {
  if (!meetingId) return;
  try {
    const res = await fetch(`${BASE_URL}/meeting-actions/${meetingId}`);
    const result = await res.json();
    if (res.ok) {
      setTrackedActions(result.actions || []);
    }
  } catch (err) {
    console.error("Tracked actions fetch failed:", err);
  }
}, [meetingId, BASE_URL]);

useEffect(() => {
  if (!meetingId) return;
  let interval;
  let active = true; // prevent state updates after unmount

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${BASE_URL}/meeting-summary/${meetingId}`);

      if (res.status === 404) {
        clearInterval(interval);
        if (active) { setIsProcessing(false); hideLoader(); }
        return;
      }

      const result = await res.json();

      if (result.status === "completed") {
        if (active) {
          setData(result);
          setIsProcessing(false);
          hideLoader();
        }
        clearInterval(interval);
        await fetchTrackedActions(); // only once, after completion
      }
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      if (active) { setIsProcessing(false); hideLoader(); }
    }
  };

  showLoader();
  fetchSummary(); // immediate first call
  interval = setInterval(fetchSummary, 3000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}, [meetingId, BASE_URL, fetchTrackedActions, showLoader, hideLoader]); // ✅ stable deps only

const updateActionStatus = async (actionId, newStatus) => {
  // ✅ 1. Instant UI update
  setTrackedActions((prev) =>
    prev.map((a) =>
      a.action_id === actionId ? { ...a, status: newStatus } : a
    )
  );

  try {
    // ✅ 2. API call in background
    const res = await fetch(`${BASE_URL}/update-action-status/${actionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      throw new Error("Failed");
    }

  } catch (err) {
    console.error(err);

    // ❗ rollback if API fails
    setTrackedActions((prev) =>
      prev.map((a) =>
        a.action_id === actionId
          ? { ...a, status: newStatus === "Done" ? "Pending" : "Done" }
          : a
      )
    );
  }
};
if (isProcessing) {
  return (
    <div className="summary-page">
      <div className="processing-state">
        <h2>⏳ Processing your meeting...</h2>
        <p>Transcribing audio and generating insights...</p>
      </div>
    </div>
  );
}
  return (
    
    <div className="summary-page">

      {/* BACK */}
      <div className="back-btn" onClick={() => navigate(-1)}>
        <span className="back-arrow">←</span> Back to Meetings
      </div>

      {/* ═══ HERO SECTION ═══ */}
      <div className="meeting-hero">
        <div className="meeting-hero-left">
          <div className="meeting-badge">
            <span className="badge-dot"></span>
            AI-Powered Meeting
          </div>

          <h1 className="meeting-title">{meetingTitle}</h1>

          <div className="meeting-meta-row">
            {timeTaken && (
              <div className="meta-chip processing">
                <span className="meta-icon">⏱</span>
                Processed in {timeTaken}s
              </div>
            )}
            {meetingDate && (
              <div className="meta-chip date">
                <span className="meta-icon">📅</span>
                {formatDateTime(meetingDate)}
              </div>
            )}
            <div className="meta-chip count">
              <span className="meta-icon">✅</span>
              {actions.length} Action{actions.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <HeroVisual />
      </div>

      {/* ═══ TABS — CENTERED ═══ */}
      <div className="tabs-wrapper">
        <div className="tabs-container">
          <button
            className={`tab-item${activeTab === "summary" ? " active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            <span className="tab-icon">📋</span> Summary
          </button>
          <button
            className={`tab-item${activeTab === "actions" ? " active" : ""}`}
            onClick={() => setActiveTab("actions")}
          >
            <span className="tab-icon">✅</span> Action Items
          </button>
          <button
            className={`tab-item${activeTab === "report" ? " active" : ""}`}
            onClick={() => setActiveTab("report")}
          >
            <span className="tab-icon">📄</span> Report
          </button>
        </div>
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <div className="tab-content" key={activeTab}>

        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <>
            <div className="card summary-card">
              <div className="card-label">Overview</div>
              <div className="summary-header">
                <h3 className="card-title">Summary</h3>
                <div className="voice-controls">
                  {!isSpeaking ? (
                    <button className="speak-btn" onClick={speakText}>
                      🔊 Read Aloud
                    </button>
                  ) : (
                    <button className="stop-btn" onClick={stopSpeech}>
                      ⏹ Stop
                    </button>
                  )}
                  <select
                    className="control-select"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                  <select
                    className="control-select"
                    value={selectedVoice?.name || ""}
                    onChange={(e) => {
                      const v = voices.find((vx) => vx.name === e.target.value);
                      setSelectedVoice(v);
                      selectedVoiceRef.current = v;
                    }}
                  >
                    {voices.map((v, i) => (
                      <option key={i} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="summary-text">{insight || "No summary available"}</p>
            </div>

            <div className="insight-grid">
              <div className="card blue-card">
                <div className="card-label">Highlights</div>
                <h3 className="card-title">Key Points</h3>
                {keyPoints.length ? (
                  <ul className="styled-list">
                    {keyPoints.map((item, idx) => (
                      <li key={idx}>
                        <span className="list-bullet blue-bullet"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-msg">No key points found.</p>
                )}
              </div>

              <div className="card pink-card">
                <div className="card-label">Outcomes</div>
                <h3 className="card-title">Decisions</h3>
                {decisions.length ? (
                  <ul className="styled-list">
                    {decisions.map((item, idx) => (
                      <li key={idx}>
                        <span className="list-bullet pink-bullet"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-msg">No decisions recorded.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ACTIONS TAB */}
        {activeTab === "actions" && (
  <div className="card mauve-card enhanced-actions-card">
    <div className="card-label">Tasks</div>
    <h3 className="card-title" style={{ marginBottom: "20px" }}>
      Action Items Progress
    </h3>

    {trackedActions.length ? (
      <div className="tracked-actions-list">
        {trackedActions.map((item, idx) => (
          <div key={item.action_id} className="tracked-action-card">
            <div className="tracked-header">
              <div className="action-num">{idx + 1}</div>
              <span className={`status-badge ${item.status.toLowerCase().replace(" ", "-")}`}>
                {item.status}
              </span>
            </div>

            <div className="action-text">{item.task}</div>
            <label className="done-checkbox">
  <input
    type="checkbox"
    checked={item.status === "Done"}
    onChange={(e) =>
      updateActionStatus(
        item.action_id,
        e.target.checked ? "Done" : "Pending"
      )
    }
  />
  <span>Mark as done</span>
</label>
          </div>
        ))}
      </div>
    ) : actions.length ? (
      <div className="actions-list">
        {actions.map((item, idx) => (
          <div key={idx} className="action-item-row">
            <div className="action-num">{idx + 1}</div>
            <div className="action-text">{item}</div>
          </div>
        ))}
      </div>
    ) : (
      <p className="empty-msg">No action items found.</p>
    )}
  </div>
)}
        {/* REPORT TAB */}
        {activeTab === "report" && (
          <div className="card report-card">
            <div className="report-inner">
              <div className="report-illustration">📄</div>
              <h3 className="report-title">Full Meeting Report</h3>
              <p className="report-desc">
                View a detailed formatted report for <strong>{meetingTitle}</strong> including
                summary, key points, action items, and decisions.
              </p>
              <button
                className="primary-btn"
                onClick={() =>
                  navigate("/share-report", {
                    state: {
                      meeting_id: meetingId,
                      title: meetingTitle,
                      date: meetingDate,
                      insight,
                      key_points: keyPoints,
                      action_items: actions,
                      decisions,
                    },
                  })
                }
              >
                📋 View Full Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryPage;