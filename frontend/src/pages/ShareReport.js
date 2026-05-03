import React, { useState, useEffect, useCallback, useRef } from "react";
import "../styles/ShareReport.css";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function ShareReport() {
  const newItemRef = useRef(null);
  const [expandedTag, setExpandedTag] = useState(null);
  //UNDO STAE//
  const [lastDeleted, setLastDeleted] = useState(null);
  const [sending, setSending] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showParticipants] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [tempSummary, setTempSummary] = useState("");

  const [isEditingKP, setIsEditingKP] = useState(false);
  const [tempKP, setTempKP] = useState([]);

  const [isEditingAI, setIsEditingAI] = useState(false);
  const [tempAI, setTempAI] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [participants, setParticipants] = useState([]);
  const [others, setOthers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  // const [report, setReport] = useState(null);
  const BASE_URL = process.env.REACT_APP_API_URL;

  const location = useLocation();
  const meetingId = location.state?.meeting_id;

  console.log("Meeting ID:", meetingId);
  console.log("BASE_URL:", BASE_URL);
  const [editableReport, setEditableReport] = useState({
    title: "",
    summary: "",
    key_points: [],
    action_items: [],
  });

  const fetchRecipients = useCallback(async () => {
    if (!meetingId) {
      console.log("No meeting ID found");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/get-recipients/${meetingId}`);
      const data = await res.json();

      setParticipants(data.participants);
      setOthers(data.non_participants);

      setSelectedEmails(data.participants.map((p) => p.email));
    } catch (err) {
      console.error(err);
    }
  }, [BASE_URL, meetingId]);

  const fetchReport = useCallback(async () => {
    if (!meetingId) return;

    try {
      const res = await fetch(`${BASE_URL}/get-meeting/${meetingId}`);
      const data = await res.json();

      setEditableReport({
        title: data.title || "",
        summary: data.summary || "",
        key_points: data.key_points || [],
        action_items: data.action_items || [],
      });
    } catch (err) {
      console.error(err);
    }
  }, [BASE_URL, meetingId]);

  useEffect(() => {
    if (meetingId) {
      fetchRecipients();
      fetchReport();
    }
  }, [meetingId, fetchRecipients, fetchReport]);

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
    toast.error("Please select at least one recipient");
    return;
  }

  setSending(true);

  try {
    const response = await fetch(`${BASE_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_id: meetingId,
        selected_emails: selectedEmails,
        report: editableReport,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message || "Email sent successfully 🚀");
    } else {
      toast.error(data.error || "Failed to send email");
    }

  } catch (error) {
    toast.error("Server error. Try again.");
  }

  setSending(false);
};

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="share-page">
      {status && (
        <div className="status">
          {status}

          {lastDeleted && (
            <button
              className="undo-btn"
              onClick={() => {
                const updated = [...tempAI];
                updated.splice(lastDeleted.index, 0, lastDeleted.item);
                setTempAI(updated);

                setLastDeleted(null);
                setStatus("");
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
      <h1 className="title">Meeting Report</h1>

      <div className="report-card" id="report">
        {/* ✅ ADD THIS BLOCK */}
        <div className="print-header">
          <h1>Meeting Report</h1>
          <div className="meta">
            <span>
              <strong>Meeting ID:</strong> {meetingId}
            </span>
            <span style={{ marginLeft: "20px" }}>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* existing content */}
        <div className="section">
          <div className="section-header">
            <h2>{isEditingTitle ? tempTitle : editableReport.title}</h2>

            {!isEditingTitle && (
              <button
                className="edit-btn"
                onClick={() => {
                  setTempTitle(editableReport.title);
                  setIsEditingTitle(true);
                }}
              >
                ✏️
              </button>
            )}
          </div>

          {isEditingTitle && (
            <>
              <input
                className="edit-input"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
              />

              <div className="edit-actions">
                <button
                  className="save-btn"
                  onClick={() => {
                    setEditableReport({
                      ...editableReport,
                      title: tempTitle,
                    });
                    setIsEditingTitle(false);

                    setStatus("Saved ✓");
                    setTimeout(() => setStatus(""), 2000);
                  }}
                >
                  Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => setIsEditingTitle(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h3>Summary</h3>

            {!isEditingSummary && (
              <button
                className="edit-btn"
                onClick={() => {
                  setTempSummary(editableReport.summary);
                  setIsEditingSummary(true);
                }}
              >
                ✏️
              </button>
            )}
          </div>

          <div className="summary-container">
            {isEditingSummary ? (
              <>
                <div
                  contentEditable
                  className="edit-box"
                  suppressContentEditableWarning={true}
                  onBlur={(e) => setTempSummary(e.currentTarget.innerText)}
                >
                  {tempSummary}
                </div>
                <div className="edit-actions">
                  <button
                    className="save-btn"
                    onClick={() => {
                      setEditableReport({
                        ...editableReport,
                        summary: tempSummary,
                      });
                      setIsEditingSummary(false);

                      setStatus("Saved ✓");
                      setTimeout(() => setStatus(""), 2000);
                    }}
                  >
                    Save
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={() => setIsEditingSummary(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p className="summary-text">
                {editableReport.summary?.trim() === "..." ||
                !editableReport.summary?.trim()
                  ? ""
                  : editableReport.summary}
              </p>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h3>Key Points</h3>

            {!isEditingKP && (
              <button
                className="edit-btn"
                onClick={() => {
                  setTempKP([...editableReport.key_points]);
                  setIsEditingKP(true);
                }}
              >
                ✏️
              </button>
            )}
          </div>

          {isEditingKP ? (
            <>
              {tempKP.map((point, i) => (
                <input
                  key={i}
                  className="edit-input"
                  value={point}
                  onChange={(e) => {
                    const updated = [...tempKP];
                    updated[i] = e.target.value;
                    setTempKP(updated);
                  }}
                />
              ))}

              <div className="edit-actions">
                <button
                  className="save-btn"
                  onClick={() => {
                    setEditableReport({
                      ...editableReport,
                      key_points: tempKP,
                    });
                    setIsEditingKP(false);
                    setStatus("Saved ✓");
                    setTimeout(() => setStatus(""), 2000);
                  }}
                >
                  Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => setIsEditingKP(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="summary-container">
              <ul>
                {editableReport.key_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h3>Action Items</h3>

            {!isEditingAI && (
              <button
                className="edit-btn"
                onClick={() => {
                  setTempAI([...editableReport.action_items]);
                  setIsEditingAI(true);
                }}
              >
                ✏️
              </button>
            )}
          </div>

          {isEditingAI ? (
            <>
              {tempAI.map((item, i) => (
                <div key={i} className="edit-row">
                  <input
                    ref={i === tempAI.length - 1 ? newItemRef : null}
                    className="edit-input"
                    value={item}
                    onChange={(e) => {
                      const updated = [...tempAI];
                      updated[i] = e.target.value;
                      setTempAI(updated);
                    }}
                  />

                  <button
                    className="delete-btn"
                    onClick={() => setDeleteIndex(i)}
                  >
                    ❌
                  </button>
                </div>
              ))}

              {/* ➕ Add new item */}
              <button
                className="add-btn"
                onClick={() => {
                  setTempAI([...tempAI, ""]);
                  setTimeout(() => {
                    newItemRef.current?.focus();
                  }, 0);
                }}
              >
                + Add Item
              </button>

              <div className="edit-actions">
                <button
                  className="save-btn"
                  onClick={() => {
                    setEditableReport({
                      ...editableReport,
                      action_items: tempAI,
                    });
                    setIsEditingAI(false);

                    setStatus("Saved ✓");
                    setTimeout(() => setStatus(""), 2000);
                  }}
                >
                  Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => setIsEditingAI(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="summary-container">
              <ul>
                {editableReport.action_items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <button className="pdf-btn" onClick={downloadPDF}>
        Download PDF
      </button>

      <div className="email-box">
        <h2>Send Report to Participants</h2>
        <div className="selected-tags">
          {selectedEmails.map((email, i) => (
            <span
              key={i}
              className={`tag ${expandedTag === email ? "expanded" : ""}`}
              onClick={() =>
                setExpandedTag(expandedTag === email ? null : email)
              }
              title={email}
            >
              {email}

              <span
                className="remove-tag"
                onClick={(e) => {
                  e.stopPropagation(); // 🔥 important (prevents expand click)
                  setSelectedEmails(selectedEmails.filter((e) => e !== email));
                }}
              >
                ✕
              </span>
            </span>
          ))}
        </div>
        <div className="button-row">
          {showParticipants && (
            <div className="participants-box">
              <h3>Participants</h3>

              {participants.map((p) => (
                <p key={p.user_id}>
                  {p.name} ({p.email})
                </p>
              ))}
            </div>
          )}
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
          <button
            className="send-btn"
            onClick={handleSendEmail}
            disabled={sending || selectedEmails.length === 0}
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>

      {deleteIndex !== null && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Action Item?</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteIndex(null)}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-btn"
                onClick={() => {
                  const removedItem = tempAI[deleteIndex];

                  setLastDeleted({
                    item: removedItem,
                    index: deleteIndex,
                  });

                  const updated = tempAI.filter(
                    (_, index) => index !== deleteIndex,
                  );
                  setTempAI(updated);
                  setDeleteIndex(null);

                  setStatus("Deleted");

                  setTimeout(() => {
                    setStatus("");
                    setLastDeleted(null);
                  }, 4000);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareReport;
