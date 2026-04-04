
import "../styles/SummaryPage.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SummaryPage() {
  const navigate = useNavigate();
  // DATA STATES
  const [keyPoints, setKeyPoints] = useState([]);
  const [actions, setActions] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [insight, setInsight] = useState("");
  const [timeTaken, setTimeTaken] = useState(null);

  // UI STATES
  const [loading, setLoading] = useState(false);
  // const [selected, setSelected] = useState([]);

  // API CALL
  const uploadAudio = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const user = JSON.parse(localStorage.getItem("user"));
  formData.append("user_id", user.user_id); // ✅ ADD THIS

    const res = await fetch("http://localhost:5000/process-audio", {
      method: "POST",
      body: formData,
    });

    return await res.json();
  };

  // HANDLE FILE
const handleFileUpload = async (file) => {
  if (!file) return;

  setLoading(true);

  const result = await uploadAudio(file);

  if (result && result.success) {

    // // 1️⃣ Insert into meetings
    // const { data: meeting, error: meetingError } = await supabase
    //   .from("meetings")
    //   .insert([{
    //     user_id: user.user_id,   // IMPORTANT: match your schema
    //     title: file.name,
    //     meeting_date: new Date(),
    //     transcript: "temp transcript" // later from backend
    //   }])
    //   .select()
    //   .single();

    // if (meetingError) {
    //   console.error(meetingError);
    //   return;
    // }

    // // 2️⃣ Insert into summaries
    // const { error: summaryError } = await supabase
    //   .from("summaries")
    //   .insert([{
    //     meeting_id: meeting.meeting_id,
    //     summary_text: result.insight,

    //     // 👇 IMPORTANT
    //     key_points: JSON.stringify(result.key_points),
    //     action_items: JSON.stringify(result.action_items)
    //   }]);

    // if (summaryError) {
    //   console.error(summaryError);
    // }

    // 3️⃣ Update UI
    setInsight(result.insight);
    setKeyPoints(result.key_points);
    setActions(result.action_items);
    setDecisions(result.decisions);
    setTimeTaken(result.processing_time);
  }

  setLoading(false);
};

  // // SHARE CLICK
  // const handleShareClick = async () => {
  //   setShowShare(true);

  //   try {
  //     const res = await fetch("http://localhost:5000/participants");
  //     const data = await res.json();
  //     setParticipants(data);
  //   } catch {
  //     setParticipants([]);
  //   }
  // };

  // const toggleSelect = (email) => {
  //   if (selected.includes(email)) {
  //     setSelected(selected.filter((e) => e !== email));
  //   } else {
  //     setSelected([...selected, email]);
  //   }
  // };

  return (
    <div className="summary-page">

      {/* Upload */}
      <div className="upload-box">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
      </div>

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

      {/*  AI GENERATED INSIGHT (ALWAYS VISIBLE) */}
      <div className="glass insight-card">
        <h2>✨ AI SUMMARY</h2>

        {insight ? (
          <p>{insight}</p>
        ) : (
          <p className="placeholder">
            Upload audio to generate meeting insight
          </p>
        )}
      </div>

      {/* GRID */}
      <div className="insight-grid">

        <div className="glass purple">
          <h3>Key Points</h3>
          <ul>
            {keyPoints.map((i, index) => (
              <li key={index}>{i}</li>
            ))}
          </ul>
        </div>

        <div className="glass blue">
          <h3>Action Items</h3>
          <ul>
            {actions.map((i, index) => (
              <li key={index}>{i}</li>
            ))}
          </ul>
        </div>

        <div className="glass pink">
          <h3>Decisions</h3>
          <ul>
            {decisions.map((i, index) => (
              <li key={index}>{i}</li>
            ))}
          </ul>
        </div>

      </div>

      {/* SHARE BUTTON */}
      <div className="buttons">
        <button className="primary-btn" onClick={() => navigate("/share-report")}>
          Share Notes
        </button>
      </div>

      {/* SHARE BOX
      {showShare && (
        <div className="glass share-box">
          <h3>Select Participants</h3>

          {participants.length === 0 && (
            <p className="placeholder">No participants available</p>
          )}

          {participants.map((p) => (
            <div key={p.id} className="participant">
              <input
                type="checkbox"
                onChange={() => toggleSelect(p.email)}
              />
              <span>{p.name} ({p.email})</span>
            </div>
          ))}

          <button className="primary-btn">Send Notes</button>
        </div>
      )} */}

    </div>
  );
}

export default SummaryPage;
