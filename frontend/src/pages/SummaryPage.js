import "../styles/SummaryPage.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import Navbar from "../components/Navbar";

function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();

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
    </div>
  );
}

export default SummaryPage;






// import "../styles/SummaryPage.css";
// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// function SummaryPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 🔥 DATA FROM DASHBOARD
//   const data = location.state;

//   //DATA ITEMS
//   const keyPoints = data?.key_points || [];
//   const actions = data?.action_items || [];
//   const decisions = data?.decisions || [];
//   const insight = data?.insight || "";
//   const timeTaken = data?.processing_time || null;

//   // UI STATES
//   const [loading] = useState(false);

//   return (
//     <div className="summary-page">
//       {loading && <p className="loading">Processing meeting... ⏳</p>}

//       {/* HERO */}
//       <div className="hero">
//         <div className="hero-left">
//           <h1>MeetPilot AI</h1>
//           <p>Transform conversations into smart summaries instantly.</p>
//         </div>
//         <div className="hero-right">🤖</div>
//       </div>

//       {/* TIME */}
//       {timeTaken && (
//         <div className="time-box">⏱ Processed in {timeTaken} seconds</div>
//       )}

//       {/* AI SUMMARY */}
//       <div className="glass insight-card">
//         <h2>✨ AI SUMMARY</h2>

//         {insight ? (
//           <p>{insight}</p>
//         ) : (
//           <p className="placeholder">
//             Upload a meeting from dashboard to see summary
//           </p>
//         )}
//       </div>

//       {/* GRID */}
//       <div className="insight-grid">
//         <div className="glass purple">
//           <h3>Key Points</h3>
//           {keyPoints.length > 0 ? (
//             <ul>
//               {keyPoints.map((i, index) => (
//                 <li key={index}>{i}</li>
//               ))}
//             </ul>
//           ) : (
//             <p className="placeholder">No key points</p>
//           )}
//         </div>

//         <div className="glass blue">
//           <h3>Action Items</h3>
//           {actions.length > 0 ? (
//             <ul>
//               {actions.map((i, index) => (
//                 <li key={index}>{i}</li>
//               ))}
//             </ul>
//           ) : (
//             <p className="placeholder">No action items</p>
//           )}
//         </div>

//         <div className="glass pink">
//           <h3>Decisions</h3>
//           {decisions.length > 0 ? (
//             <ul>
//               {decisions.map((i, index) => (
//                 <li key={index}>{i}</li>
//               ))}
//             </ul>
//           ) : (
//             <p className="placeholder">No decisions</p>
//           )}
//         </div>
//       </div>

//       {/* SHARE BUTTON */}
//       <div className="buttons">
//         <button
//           className="primary-btn"
//           onClick={() =>
//             navigate("/share-report", {
//               state: {
//                 meeting_id: data?.meeting_id,
//               },
//             })
//           }
//         >
//           Share Notes
//         </button>
//       </div>
//     </div>
//   );
// }

// export default SummaryPage;


