
import "../styles/SummaryPage.css";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 DATA FROM DASHBOARD
  const data = location.state;

  //DATA ITEMS
const keyPoints = data?.key_points || [];
const actions = data?.action_items || [];
const decisions = data?.decisions || [];
const insight = data?.insight || "";
const timeTaken = data?.processing_time || null;

  // UI STATES
  const [loading] = useState(false);

  return (
    <div className="summary-page">

      {loading && <p className="loading">Processing meeting... ⏳</p>}

      {/* HERO */}
      <div className="hero">
        <div className="hero-left">
          <h1>MeetPilot AI</h1>
          <p>Transform conversations into smart summaries instantly.</p>
        </div>
        <div className="hero-right">🤖</div>
      </div>

      {/* TIME */}
      {timeTaken && (
        <div className="time-box">
          ⏱ Processed in {timeTaken} seconds
        </div>
      )}

      {/* AI SUMMARY */}
      <div className="glass insight-card">
        <h2>✨ AI SUMMARY</h2>

        {insight ? (
          <p>{insight}</p>
        ) : (
          <p className="placeholder">
            Upload a meeting from dashboard to see summary
          </p>
        )}
      </div>

      {/* GRID */}
      <div className="insight-grid">

        <div className="glass purple">
          <h3>Key Points</h3>
          {keyPoints.length > 0 ? (
            <ul>
              {keyPoints.map((i, index) => (
                <li key={index}>{i}</li>
              ))}
            </ul>
          ) : (
            <p className="placeholder">No key points</p>
          )}
        </div>

        <div className="glass blue">
          <h3>Action Items</h3>
          {actions.length > 0 ? (
            <ul>
              {actions.map((i, index) => (
                <li key={index}>{i}</li>
              ))}
            </ul>
          ) : (
            <p className="placeholder">No action items</p>
          )}
        </div>

        <div className="glass pink">
          <h3>Decisions</h3>
          {decisions.length > 0 ? (
            <ul>
              {decisions.map((i, index) => (
                <li key={index}>{i}</li>
              ))}
            </ul>
          ) : (
            <p className="placeholder">No decisions</p>
          )}
        </div>

      </div>

      {/* SHARE BUTTON */}
      <div className="buttons">
        <button
          className="primary-btn"
          onClick={() => navigate("/share-report")}
        >
          Share Notes
        </button>
      </div>

    </div>
  );
}

export default SummaryPage;
