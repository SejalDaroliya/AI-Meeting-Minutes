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

  // 🔥 DATA FROM DASHBOARD
  const [data, setData] = useState(location.state || null);

  const { showLoader, hideLoader } = useLoader();

  // DATA ITEMS
  //DATA ITEMS
  const keyPoints = data?.key_points || [];
  const actions = data?.action_items || [];
  const decisions = data?.decisions || [];
  const insight = data?.insight || "";
  const timeTaken = data?.processing_time || null;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchSummary = async () => {
      if (!meetingId) return;
  return (
    <div className="summary-page">
      {loading && <p className="loading">Processing meeting... ⏳</p>}

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

    // Only fetch if no full data (means came from "View")
    if (!location.state?.transcript && meetingId) {
      fetchSummary();
    }
  }, [meetingId]);


  // 🔊 READ ALOUD FUNCTION
  const speakText = () => {
    if (!data) return;

    const text = `
      Summary: ${insight}
      Key Points: ${keyPoints.join(", ")}
      Action Items: ${actions.join(", ")}
      Decisions: ${decisions.join(", ")}
    `;

    const speech = new SpeechSynthesisUtterance(text);

    // ✅ Better voice settings
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

  // 🔥 Stop speech when leaving page
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
  const fetchSummary = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/meeting-summary/${meetingId}`
      );

      const data = await res.json();

      setData(data); // your state
    } catch (err) {
      console.error(err);
    }
  };

  if (meetingId) {
    fetchSummary();
  }
}, [meetingId]);

  return (
    <div className="summary-page">
      {/* TIME */}
      {timeTaken && (
        <div className="time-box">⏱ Processed in {timeTaken} seconds</div>
      )}

      {/* AI SUMMARY */}
      <div className="glass insight-card">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
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
          onClick={() =>
            navigate("/share-report", {
              state: {
                meeting_id: data?.meeting_id,
              },
            })
          }
        >
          Share Notes
        </button>
      </div>

      {/* Reminder Modal */}
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
