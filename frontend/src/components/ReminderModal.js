import React, { useEffect, useState } from "react";
import "../styles/ReminderModal.css";

function Reminder({ meetingId, userId, onClose, onAdd }) {
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // ✅ FIX: remove isOpen, always fetch on mount
  useEffect(() => {
    fetch(`${BASE_URL}/users`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, [BASE_URL]);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter(u => u !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!title || !date) {
      alert("Fill required fields");
      return;
    }

    const res = await fetch(`${BASE_URL}/create-reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        message,
        reminder_time: date,
        selected_users: selectedUsers
      })
    });

    const data = await res.json();

    if (data.message) {
      // ✅ FIX: call onAdd safely
      if (onAdd) {
        onAdd({ title, message, date });
      }

      onClose();
    } else {
      alert("Error creating reminder");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h2>Create Reminder</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="modal-input"
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="modal-textarea"
        />

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="modal-input"
        />

        <div className="users-dropdown">
          <h4>Select Users</h4>

          <div className="users-list">
            {users.map((user) => (
              <label key={user.user_id} className="user-item">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.user_id)}
                  onChange={() => toggleUser(user.user_id)}
                />
                {user.name} ({user.email})
              </label>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button className="btn-primary" onClick={handleSave}>
            Create Reminder
          </button>
        </div>

      </div>
    </div>
  );
}

export default Reminder;