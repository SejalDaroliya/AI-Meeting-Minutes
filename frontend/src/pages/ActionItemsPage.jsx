import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MeetingPage.css";

function ActionItemsPage() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [meetings, setMeetings] = useState([]);
  const [openMeeting, setOpenMeeting] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!storedUser?.user_id) return;

    fetch(`${BASE_URL}/action-items/${storedUser.user_id}`)
      .then((res) => res.json())
      .then((data) => setMeetings(data.meetings || []))
      .catch((err) => console.error(err));
  }, [BASE_URL, storedUser?.user_id]);

  const toggleMeeting = (meetingId) => {
    setOpenMeeting(openMeeting === meetingId ? null : meetingId);
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
        <h1>Action Items</h1>
        <p>Manage all tasks extracted from your meetings.</p>

        <div className="card-list">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting.meeting_id} className="meeting-group">
                <div
                  className="meeting-header"
                  onClick={() => toggleMeeting(meeting.meeting_id)}
                >
                  <div>
                    <h3>{meeting.meeting_title}</h3>
                    <span>
                      {new Date(meeting.meeting_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span>
                    {openMeeting === meeting.meeting_id ? "▲" : "▼"}
                  </span>
                </div>

                {openMeeting === meeting.meeting_id && (
                  <ul className="task-list">
                    {meeting.tasks.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          ) : (
            <p>No action items found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActionItemsPage;