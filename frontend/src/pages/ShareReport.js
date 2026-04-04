import React, { useState } from "react";
import "../styles/ShareReport.css";

function ShareReport() {

  const [emails, setEmails] = useState("");
  const [status, setStatus] = useState("");

  const handleSendEmail = async () => {

    try {

      const response = await fetch("http://localhost:5000/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emails: emails.split(","),
          report: "Meeting report sent"
        })
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

        <input
          type="text"
          placeholder="Enter emails separated by comma"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
        />

        <button className="send-btn" onClick={handleSendEmail}>
          Send Email
        </button>

        {status && <p className="status">{status}</p>}

      </div>

    </div>
  );
}

export default ShareReport;