import React, { useEffect, useState } from "react";
import "../styles/ReminderPage.css";

function ReminderPage() {
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [showUsersDropdown, setShowUsersDropdown] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // ✅ fetch users
  useEffect(() => {
    fetch(`${BASE_URL}/users`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, [BASE_URL]);

  useEffect(() => {
  if (!storedUser?.user_id) return;

  fetch(`${BASE_URL}/reminders/${storedUser.user_id}`)
    .then((res) => res.json())
    .then((data) => setReminders(data.reminders || []));
}, [BASE_URL, storedUser?.user_id]);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter(u => u !== id)
        : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!title || !date) {
      alert("Fill required fields");
      return;
    }

    const res = await fetch(`${BASE_URL}/create-reminder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        message,
        reminder_time: date,
        selected_users: selectedUsers
      })
    });

    const data = await res.json();

    if (data.message) {
      // add to UI
      setReminders([
  ...reminders,
  {
    title,
    message,
    reminder_time: date,
    sent: false
  }
]);

      // reset
      setTitle("");
      setMessage("");
      setDate("");
      setSelectedUsers([]);

      setShowForm(false);
    } else {
      alert("Error creating reminder");
    }
  };

  return (
    <div className="reminder-container">

      {/* HEADER */}
      <div className="reminder-header">
        <div>
          <h1>Reminders</h1>
          <p>Stay on top of follow-ups and deadlines.</p>
        </div>

        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Add Reminder
        </button>
      </div>

      {/* FORM (LIKE YOUR IMAGE 2) */}
      {showForm && (
        <div className="form-wrapper">
          <div className="form-box">

            <div className="form-grid">

  <input
    placeholder="Meeting Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />

  <input
    type="datetime-local"
    value={date}
    onChange={(e) => setDate(e.target.value)}
  />

</div>

<textarea
  placeholder="Message"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>

            {/* USERS */}
            <div className="users-box">
              <h4>Select Users</h4>

              {/* DROPDOWN BUTTON */}
              <div
                className="dropdown-btn"
                onClick={() => setShowUsersDropdown(!showUsersDropdown)}
              >
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} users selected`
                  : "Select users"}
              </div>

              {/* DROPDOWN LIST */}
              {showUsersDropdown && (
                <div className="dropdown-list">
                  {users.map((u) => (
                    <label key={u.user_id} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.user_id)}
                        onChange={() => toggleUser(u.user_id)}
                      />
                      {u.email}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button onClick={() => setShowForm(false)}>Cancel</button>
              <button onClick={handleCreate}>Create</button>
            </div>

          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {reminders.length === 0 ? (
        <div className="empty-box">
          <h3>No reminders yet</h3>
          <p>Create one to get started</p>
        </div>
      ) : (
        <div className="reminder-list">
          {reminders.map((r, i) => (
            <div key={i} className="reminder-card">
              <h3>{r.title}</h3>
              <p>{r.message}</p>
              <span>{new Date(r.reminder_time).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ReminderPage;