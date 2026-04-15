import React, { useState } from "react";
import "../styles/ReminderModal.css";

const BASE_URL = "http://localhost:5000";

function Reminder({ meetingId, userId, onClose }) {
  const [datetime, setDatetime] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ CREATE REMINDER
  const handleCreateReminder = async () => {
    if (!datetime) {
      alert("Please select date & time ⏰");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/create-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          user_id: userId,
          reminder_time: datetime,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Reminder created successfully ✅");

        // 🔥 OPTIONAL: trigger reminder check manually (for testing)
        await fetch(`${BASE_URL}/run-reminder`);

        onClose();
      } else {
        alert(data.error || "Failed to create reminder");
      }
    } catch (err) {
      console.error("Reminder error:", err);
      alert("Server error ❌");
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Set Reminder ⏰</h2>

        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
        />

        <div className="modal-buttons">
          <button onClick={handleCreateReminder} disabled={loading}>
            {loading ? "Setting..." : "Set Reminder"}
          </button>

          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reminder;