
import "../styles/SummaryPage.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// import React, { useState } from "react";
// import "./SummaryPage.css";

// function SummaryPage() {

//   // DATA STATES
//   const [keyPoints, setKeyPoints] = useState([]);
//   const [actions, setActions] = useState([]);
//   const [decisions, setDecisions] = useState([]);
//   const [insight, setInsight] = useState("");
//   const [timeTaken, setTimeTaken] = useState(null);

//   // UI STATES
//   const [loading, setLoading] = useState(false);
//   const [showShare, setShowShare] = useState(false);

//   const [participants, setParticipants] = useState([]);
//   const [selected, setSelected] = useState([]);

//   // API CALL
//   const uploadAudio = async (file) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch("http://localhost:5000/process-audio", {
//       method: "POST",
//       body: formData,
//     });

//     return await res.json();
//   };

//   // HANDLE FILE
//   const handleFileUpload = async (file) => {
//     if (!file) return;

//     setLoading(true);

//     const result = await uploadAudio(file);

//     if (result && result.success) {
//       setInsight(result.insight);
//       setKeyPoints(result.key_points);
//       setActions(result.action_items);
//       setDecisions(result.decisions);
//       setTimeTaken(result.processing_time);
//     }

//     setLoading(false);
//   };

//   // SHARE CLICK
//   const handleShareClick = async () => {
//     setShowShare(true);

//     try {
//       const res = await fetch("http://localhost:5000/participants");
//       const data = await res.json();
//       setParticipants(data);
//     } catch {
//       setParticipants([]);
//     }
//   };

//   const toggleSelect = (email) => {
//     if (selected.includes(email)) {
//       setSelected(selected.filter((e) => e !== email));
//     } else {
//       setSelected([...selected, email]);
//     }
//   };

//   return (
//     <div className="summary-page">

//       {/* Upload */}
//       <div className="upload-box">
//         <input
//           type="file"
//           accept="audio/*"
//           onChange={(e) => handleFileUpload(e.target.files[0])}
//         />
//       </div>

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
//         <div className="time-box">
//           ⏱ Processed in {timeTaken} seconds
//         </div>
//       )}

//       {/* INSIGHT */}
//       <div className="glass insight-card">
//         <h2>✨ AI Generated Meeting Insight</h2>

//         {insight ? (
//           <p>{insight}</p>
//         ) : (
//           <p className="placeholder">
//             Upload audio to generate meeting insight
//           </p>
//         )}
//       </div>

//       {/* GRID */}
//       <div className="insight-grid">

//         {/* KEY POINTS */}
//         <div className="glass purple">
//           <h3>Key Points</h3>
//           <ul>
//             {keyPoints.map((i, index) => (
//               <li key={index}>{i}</li>
//             ))}
//           </ul>
//         </div>

//         {/* 🔥 FIXED ACTION ITEMS */}
//         <div className="glass blue">
//           <h3>Action Items</h3>
//           <ul>
//             {actions.length > 0 ? (
//               actions.map((item, index) => {

//                 // NEW FORMAT (object)
//                 if (typeof item === "object") {
//                   return (
//                     <li key={index}>
//                       <strong>{item.task}</strong>{" "}
//                       {item.priority === "HIGH" ? "🔥" : "✅"}
//                     </li>
//                   );
//                 }

//                 // OLD FORMAT (string)
//                 return <li key={index}>{item}</li>;
//               })
//             ) : (
//               <li className="placeholder">No action items</li>
//             )}
//           </ul>
//         </div>

//         {/* DECISIONS */}
//         <div className="glass pink">
//           <h3>Decisions</h3>
//           <ul>
//             {decisions.map((i, index) => (
//               <li key={index}>{i}</li>
//             ))}
//           </ul>
//         </div>

//       </div>

//       {/* SHARE BUTTON */}
//       <div className="buttons">
//         <button className="primary-btn" onClick={handleShareClick}>
//           Share Notes
//         </button>
//       </div>

//       {/* SHARE BOX */}
//       {showShare && (
//         <div className="glass share-box">
//           <h3>Select Participants</h3>

//           {participants.length === 0 && (
//             <p className="placeholder">No participants available</p>
//           )}

//           {participants.map((p) => (
//             <div key={p.id} className="participant">
//               <input
//                 type="checkbox"
//                 onChange={() => toggleSelect(p.email)}
//               />
//               <span>{p.name} ({p.email})</span>
//             </div>
//           ))}

//           <button className="primary-btn">Send Notes</button>
//         </div>
//       )}

//     </div>
//   );
// }

// export default SummaryPage;

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
  const [showShare, setShowShare] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [selected, setSelected] = useState([]);

  // API CALL
  const uploadAudio = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

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
      setInsight(result.insight);
      setKeyPoints(result.key_points);
      setActions(result.action_items);
      setDecisions(result.decisions);
      setTimeTaken(result.processing_time);
    }

    setLoading(false);
  };

  // SHARE CLICK
  const handleShareClick = async () => {
    setShowShare(true);

    try {
      const res = await fetch("http://localhost:5000/participants");
      const data = await res.json();
      setParticipants(data);
    } catch {
      setParticipants([]);
    }
  };

  const toggleSelect = (email) => {
    if (selected.includes(email)) {
      setSelected(selected.filter((e) => e !== email));
    } else {
      setSelected([...selected, email]);
    }
  };

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

      {/* SHARE BOX */}
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
      )}

    </div>
  );
}

export default SummaryPage;



// with transcript 
// import React from "react";
// import "./SummaryPage.css";

// function SummaryPage() {

//   const transcript = [
//     {speaker:"Speaker 1", text:"Hello everyone, welcome to today's meeting."},
//     {speaker:"Speaker 2", text:"Today we will discuss the development progress."},
//     {speaker:"Speaker 3", text:"Frontend UI is almost completed."},
//     {speaker:"Speaker 1", text:"Backend integration will start next week."}
//   ];

//   const keyPoints=[
//     "Project progress reviewed",
//     "Frontend UI near completion",
//     "Backend integration planning"
//   ];

//   const actions=[
//     "Finish UI components",
//     "Start backend API integration",
//     "Prepare prototype demo"
//   ];

//   const decisions=[
//     "Prototype launch planned for next week"
//   ];

//   return(

//     <div className="summary-page">

//       {/* decorative gradient shapes */}
//       <div className="blob blob-a"></div>
//       <div className="blob blob-b"></div>
//       <div className="blob blob-c"></div>

//       {/* HERO */}

//       <div className="hero">

//         <div className="hero-left">

//           <h1>MeetPilot AI</h1>

//           <p>
//             AI powered meeting intelligence that transforms conversations
//             into summaries, insights and decisions instantly.
//           </p>

//         </div>

//         <div className="hero-right">
//           🤖
//         </div>

//       </div>


//       {/* AI SUMMARY */}

//       <div className="ai-summary glass">

//         <h2>✨ AI Generated Meeting Insight</h2>

//         <p>
//           The team reviewed project progress and confirmed that the
//           frontend interface is nearing completion. Backend integration
//           will begin next week, and a working prototype is planned for
//           demonstration.
//         </p>

//       </div>


//       {/* INSIGHT GRID */}

//       <div className="insight-grid">

//         <div className="insight glass purple">

//           <h3> Key Points</h3>

//           <ul>
//             {keyPoints.map((i,index)=>(
//               <li key={index}>{i}</li>
//             ))}
//           </ul>

//         </div>


//         <div className="insight glass blue">

//           <h3> Action Items</h3>

//           <ul>
//             {actions.map((i,index)=>(
//               <li key={index}>{i}</li>
//             ))}
//           </ul>

//         </div>


//         <div className="insight glass pink">

//           <h3> Decisions</h3>

//           <ul>
//             {decisions.map((i,index)=>(
//               <li key={index}>{i}</li>
//             ))}
//           </ul>

//         </div>

//       </div>


//       {/* TRANSCRIPT */}

//       <div className="transcript glass">

//         <h2> Meeting Transcript</h2>

//         {transcript.map((line,index)=>(
//           <div className="chat-line" key={index}>

//             <div className="speaker">
//               {line.speaker}
//             </div>

//             <div className="bubble">
//               {line.text}
//             </div>

//           </div>
//         ))}

//       </div>


//       {/* BUTTONS */}

//       <div className="buttons">

//         <button className="primary-btn">
//           Copy Summary
//         </button>

//         <button className="secondary-btn">
//           Download Notes
//         </button>

//       </div>

//     </div>
//   )

// }

// export default SummaryPage;