import React, { useState, useEffect, useCallback } from "react";
import "../styles/ShareReport.css";

function ShareReport() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [participants, setParticipants] = useState([]);
  const [others, setOthers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_URL;

  const fetchRecipients = useCallback(async () => {
  try {
    const res = await fetch(`${BASE_URL}/get-recipient/1`);
    const data = await res.json();

    setParticipants(data.participants);
    setOthers(data.non_participants);

    setSelectedEmails(data.participants.map((p) => p.email));
  } catch (err) {
    console.error(err);
  }
}, [BASE_URL]);

  useEffect(() => {
  fetchRecipients();
}, [fetchRecipients]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleEmail = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );
  };

  const handleSendEmail = async () => {
    if (selectedEmails.length === 0) {
      setStatus("Please select at least one recipient");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meeting_id: 1, // 🔁 later make dynamic
          selected_emails: selectedEmails, // ✅ THIS IS KEY
        }),
      });

      const data = await response.json();

      setStatus(data.message || "Email sent successfully");
    } catch (error) {
      setStatus("Failed to send email");
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="share-page">
      <h1 className="title">Meeting Report</h1>

      <div className="report-card" id="report">
        <h2>Weekly Project Discussion</h2>

        <div className="section">
          <h3>Summary</h3>
          <p>
            The team discussed the progress of the AI Meeting Minutes system.
            The landing page and login modules have been completed and AI
            summarization is currently being tested.
          </p>
        </div>

        <div className="section">
          <h3>Key Points</h3>
          <ul>
            <li>Landing page completed</li>
            <li>Login system integrated</li>
            <li>AI summary module under testing</li>
          </ul>
        </div>

        <div className="section">
          <h3>Action Items</h3>
          <ul>
            <li>Connect SMTP email service</li>
            <li>Test full workflow</li>
            <li>Prepare final presentation</li>
          </ul>
        </div>
      </div>

      <button className="pdf-btn" onClick={downloadPDF}>
        Download PDF
      </button>

      <div className="email-box">
        <h2>Send Report to Participants</h2>
        <div className="selected-tags">
          {selectedEmails.map((email) => (
            <span key={email} className="tag">
              {email}
              <span
                onClick={() => toggleEmail(email)}
                style={{
                  marginLeft: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕
              </span>
            </span>
          ))}
        </div>
        <div className="dropdown-container">
          <button
            className="dropdown-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {selectedEmails.length > 0
              ? `${selectedEmails.length} selected`
              : "Select Recipients ▼"}
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-box"
              />
              <h4>Participants</h4>
              {participants
                .filter((user) =>
                  user.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((user) => (
                  <label key={user.user_id} className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(user.email)}
                      onChange={() => toggleEmail(user.email)}
                    />
                    <span className="user-text">
                      {user.name} ({user.email})
                    </span>
                  </label>
                ))}

              <h4>Other Users</h4>
              {others
                .filter((user) =>
                  user.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((user) => (
                  <label key={user.user_id} className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(user.email)}
                      onChange={() => toggleEmail(user.email)}
                    />
                    <span className="user-text">
                      {user.name} ({user.email})
                    </span>
                  </label>
                ))}
            </div>
          )}
        </div>

        <button className="send-btn" onClick={handleSendEmail}>
          Send Email
        </button>

        {status && <p className="status">{status}</p>}
      </div>
    </div>
  );
}

export default ShareReport;
