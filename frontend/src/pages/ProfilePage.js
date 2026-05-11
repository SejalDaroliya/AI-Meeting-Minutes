import { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import { useLoader } from "../context/LoaderContext";

const ProfilePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const BASE_URL = process.env.REACT_APP_API_URL;

  const formatTime = (t) => {
    if (!t || t === 0) return "0s";
    if (t < 1) return `${Math.round(t * 1000)} ms`;
    return `${t}s`;
  };
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
  const fetchProfile = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setError("User not logged in");
      return;
    }

    const userId = user.user_id || user.id;

    showLoader();

    try {
      const res = await fetch(`${BASE_URL}/profile/${userId}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setData(data);
        setFormData({
          name: data.name,
          email: data.email,
        });
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      hideLoader();
    }
  };

  fetchProfile();
}, [BASE_URL, showLoader, hideLoader]); // ✅ FIXED

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.user_id || user.id;

    fetch(`${BASE_URL}/update-profile/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        setData(formData);
        setIsEditing(false);

        // update localStorage
        localStorage.setItem("user", JSON.stringify({ ...user, ...formData }));
      })
      .catch(() => alert("Update failed"));
  };

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <h1 className="profile-title">Profile</h1>
      <p className="profile-subtitle">
        Manage your account and view your activity
      </p>

      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar">{data.name?.charAt(0) || "U"}</div>

        {/* Edit Button */}
        <button className="edit-btn" onClick={() => setIsEditing(true)}>
          ✏️ Edit Profile
        </button>

        {/* Editable Section */}
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />

            <div className="edit-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h2>{data.name}</h2>
            <p className="user-email">{data.email}</p>
          </>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{data.meetings}</h3>
            <p>Meetings Processed</p>
          </div>

          <div className="stat-card">
            <h3>{data.key_points}</h3>
            <p>Key Points Extracted</p>
          </div>

          <div className="stat-card">
            <h3>{data.action_items}</h3>
            <p>Action Items Extracted</p>
          </div>

          <div className="stat-card">
            <h3>{formatTime(data.avg_time)}</h3>
            <p>Avg Processing Time</p>
          </div>
        </div>
      </div>
<div className="activity-card">
  <h3>Weekly Insights</h3>

  <p className="activity-subtext">
    Overview of completed vs pending action items from your meetings.
  </p>

  <div className="bar-graph">

    {/* DONE */}
    <div className="bar-column">
      <div className="bar-track">
        <div
          className="bar-fill done"
          style={{ height: `${data.done}px` }}
        ></div>
      </div>

      <span className="bar-count">{data.done}</span>
      <p>Done</p>
    </div>

    {/* PENDING */}
    <div className="bar-column">
      <div className="bar-track">
        <div
          className="bar-fill pending"
          style={{ height: `${data.pending}px` }}
        ></div>
      </div>

      <span className="bar-count">{data.pending}</span>
      <p>Pending</p>
    </div>

  </div>
</div>
    </div>
  );
};

export default ProfilePage;
