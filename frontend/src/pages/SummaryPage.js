import "../styles/SummaryPage.css";
import React, { useState, useEffect, useRef } from "react";
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

  // 📋 SHARE
  //const [shareStatus, setShareStatus] = useState(""); // "", "copied", "error"

  const keyPoints = data?.key_points || [];
  const actions = data?.action_items || [];
  // Handle both "decisions" and "decision" key from API
  const decisions =
  typeof data?.decisions === "string"
    ? JSON.parse(data.decisions)
    : data?.decisions || [];
  const insight = data?.insight || data?.summary || "";
  const timeTaken = data?.processing_time || null;

  const meetingTitle = data?.title || "Untitled Meeting";

  const meetingDate = data?.date || data?.created_at || null;

  // ✅ LOAD VOICES — keep ref in sync so speakText always has latest
  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const v = synth.getVoices();
      if (!v.length) {
        setTimeout(loadVoices, 200);
        return;
      }
      voicesRef.current = v;
      const englishVoice = v.find((vx) => vx.lang.startsWith("en")) || v[0];
      setVoices(v);
      setSelectedVoice(englishVoice);
      selectedVoiceRef.current = englishVoice;
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  const fetchSummary = async () => {
    if (!meetingId) return;

    showLoader();

    try {
      const res = await fetch(`${BASE_URL}/meeting-summary/${meetingId}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setData(result);
    } catch (err) {
      console.error(err);
      alert("Error loading summary");
    } finally {
      hideLoader();
    }
  };

  fetchSummary();
}, [meetingId, BASE_URL, showLoader, hideLoader]);

  // 🔊 FIXED READ — uses refs so voices are always available
  const speakText = () => {
    const synth = window.speechSynthesis;

    const fullText = [
      insight ? `Summary: ${insight}.` : "",
      keyPoints.length ? `Key Points: ${keyPoints.join(". ")}.` : "",
      decisions.length ? `Decisions: ${decisions.join(". ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (!fullText.trim()) {
      alert("No content to read.");
      return;
    }

    const attemptSpeak = (attempts = 0) => {
      const availableVoices =
        voicesRef.current.length ? voicesRef.current : synth.getVoices();

      if (!availableVoices.length && attempts < 10) {
        setTimeout(() => attemptSpeak(attempts + 1), 300);
        return;
      }

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = speechRate;

      utterance.voice =
        selectedVoiceRef.current ||
        availableVoices.find((v) => v.lang.startsWith("en")) ||
        availableVoices[0] ||
        null;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error("Speech error:", e);
        setIsSpeaking(false);
      };

      synth.speak(utterance);
    };

    attemptSpeak();
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // ✅ FIXED SHARE — fallback for non-HTTPS environments
//   const handleShare = async () => {
//     const text = `Meeting: ${meetingTitle}

// Summary:
// ${insight}

// Key Points:
// ${keyPoints.join("\n")}

// Action Items:
// ${actions.join("\n")}

// Decisions:
// ${decisions.join("\n")}`;

//     // Try modern clipboard API first
//     if (navigator.clipboard && window.isSecureContext) {
//       try {
//         await navigator.clipboard.writeText(text);
//         setShareStatus("copied");
//         setTimeout(() => setShareStatus(""), 3000);
//         return;
//       } catch (err) {
//         console.warn("Clipboard API failed, using fallback:", err);
//       }
//     }

//     // Fallback: execCommand (works on HTTP / older browsers)
//     try {
//       const textarea = document.createElement("textarea");
//       textarea.value = text;
//       textarea.style.position = "fixed";
//       textarea.style.opacity = "0";
//       textarea.style.top = "0";
//       textarea.style.left = "0";
//       document.body.appendChild(textarea);
//       textarea.focus();
//       textarea.select();
//       const success = document.execCommand("copy");
//       document.body.removeChild(textarea);
//       if (success) {
//         setShareStatus("copied");
//         setTimeout(() => setShareStatus(""), 3000);
//       } else {
//         throw new Error("execCommand copy failed");
//       }
//     } catch (err) {
//       console.error("Share failed:", err);
//       setShareStatus("error");
//       setTimeout(() => setShareStatus(""), 3000);
//     }
//   };

  // ✅ FIXED DATE FORMAT — "April 16, 2026 at 5:30 AM"
  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="summary-page">
      <div className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Meetings
      </div>

      <div className="meeting-header">
        <h1 className="meeting-title">{meetingTitle}</h1>

        {timeTaken && (
          <p className="time-box">⏱ Processed in {timeTaken}s</p>
        )}

        {meetingDate && (
          <p className="meeting-meta">
            {formatDateTime(meetingDate)} • Meeting
          </p>
        )}
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <button
          className={activeTab === "summary" ? "active tab-item" : "tab-item"}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>

        <button
          className={activeTab === "actions" ? "active tab-item" : "tab-item"}
          onClick={() => setActiveTab("actions")}
        >
          Action Items
        </button>

        <button
          className={activeTab === "report" ? "active tab-item" : "tab-item"}
          onClick={() => setActiveTab("report")}
        >
          Report
        </button>
      </div>

      <div className="tab-content">

        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <>
            <div className="card highlight">
              <div className="summary-header">
                <h3>Summary</h3>

                <div className="voice-controls">
                  {!isSpeaking ? (
                    <button className="speak-btn" onClick={speakText}>
                      🔊 Read
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
                      <option key={i} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p>{insight || "No summary available"}</p>
            </div>

            <div className="insight-grid">
              <div className="card accent-blue">
                <h3>Key Points</h3>
                {keyPoints.length ? (
                  <ul>
                    {keyPoints.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-msg">No key points found.</p>
                )}
              </div>

              <div className="card accent-pink">
                <h3>Decisions</h3>
                {decisions.length ? (
                  <ul>
                    {decisions.map((item, idx) => (
                      <li key={idx}>{item}</li>
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
          <div className="card accent-mauve">
            <h3>Action Items</h3>
            {actions.length ? (
              <ul>
                {actions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-msg">No action items found.</p>
            )}
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === "report" && (
          <div className="card report-card">
            <div className="report-tab-content">
              <div className="report-icon">📄</div>
              <h3>Full Meeting Report</h3>
              <p className="report-desc">
                View a detailed formatted report for <strong>{meetingTitle}</strong> including
                summary, key points, action items, and decisions.
              </p>
              <button
                className="primary-btn report-nav-btn"
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
                📋 View Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryPage;
