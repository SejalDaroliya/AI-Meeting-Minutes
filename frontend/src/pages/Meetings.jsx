import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MeetingPage.css";

function MeetingsPage() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser?.user_id) return;

    fetch(`${BASE_URL}/user-meetings/${storedUser.user_id}`)
      .then((res) => res.json())
      .then((data) => setMeetings(data || []))
      .catch((err) => console.error(err));
  }, [BASE_URL]);

  const handleViewSummary = async (meetingId) => {
    try {
      const res = await fetch(`${BASE_URL}/meeting-summary/${meetingId}`);
      const data = await res.json();
      navigate("/summary", {
  state: {
    meeting_id: meetingId,
    title: data.title,
    transcript: data.transcript,
    summary: data.insight,
    key_points: data.key_points,
    action_items: data.action_items,
    decisions: data.decisions,
    processing_time: data.processing_time,
    date: data.date,
  },
});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-shell">
      <nav className="page-navbar">
        <h2>MeetPilot AI</h2>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </nav>

      <div className="page-content">
        <h1>All Meetings</h1>
        <p>Your complete meeting history in one place.</p>

        <div className="card-list">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting.meeting_id} className="page-card">
                <h3>{meeting.title}</h3>
                <span>
                  {new Date(meeting.date).toLocaleString()}
                </span>

                <button
                  onClick={() =>
                    handleViewSummary(meeting.meeting_id)
                  }
                >
                  View Summary
                </button>
              </div>
            ))
          ) : (
            <p>No meetings found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MeetingsPage;