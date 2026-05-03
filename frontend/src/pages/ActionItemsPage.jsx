import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MeetingPage.css";
import { useLoader } from "../context/LoaderContext";
function ActionItemsPage() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [meetings, setMeetings] = useState([]);
  const [openMeeting, setOpenMeeting] = useState(null);
  const [filter, setFilter] = useState("all");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
  const fetchActions = async () => {
    if (!storedUser?.user_id) return;

    showLoader(); // 👈 show loader when page loads

    try {
      const res = await fetch(
        `${BASE_URL}/action-items/${storedUser.user_id}`
      );
      const data = await res.json();

      setMeetings(data.meetings || []);
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader(); // 👈 hide when API finishes
    }
  };

  fetchActions();
}, [BASE_URL, storedUser?.user_id, showLoader, hideLoader]);

  const toggleMeeting = (meetingId) => {
    setOpenMeeting(openMeeting === meetingId ? null : meetingId);
  };

  // 🔥 FILTER LOGIC (DOES NOT BREAK GROUPING)
  const getFilteredTasks = (tasks) => {
    if (filter === "all") return tasks;

    return tasks.filter((t) => {
      const status =
        typeof t === "string"
          ? "pending" // fallback if backend has no status
          : (t.status || "pending").toLowerCase();

      return status === filter;
    });
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

        {/* 🔥 FILTER BUTTONS */}
        <div className="filter-bar">
          <button
            className={filter === "all" ? "active-filter" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "all" ? "active-filter" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={filter === "all" ? "active-filter" : ""}
            onClick={() => setFilter("done")}
          >
            Done
          </button>
        </div>

        <div className="card-list">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting.meeting_id} className="meeting-group">

                {/* HEADER */}
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

                {/* TASK LIST */}
                {openMeeting === meeting.meeting_id && (
                  <ul className="task-list">
                    {getFilteredTasks(meeting.tasks).map((task, idx) => {
                      const isObject = typeof task === "object";

                      const taskText = isObject ? task.task : task;
                      const status = isObject ? task.status : "Pending";

                      return (
                        <li key={idx} className="task-item">

                          <span>{taskText}</span>

                          <span
                            className={`status-pill ${status.toLowerCase()
                              }`}
                          >
                            {status}
                          </span>

                        </li>
                      );
                    })}
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