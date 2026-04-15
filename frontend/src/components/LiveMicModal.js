// LiveMicModal.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/ReminderModal.css";
import { useLoader } from "../context/LoaderContext";

function LiveMicModal({
  onClose,
  recording,
  startRecording,
  stopRecording,
  handleRecordingUpload,
  audioBlob
}) {
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const { showLoader, hideLoader } = useLoader();

  // 🎤 Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let finalTranscript = transcript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        finalTranscript += text;
      }

      setTranscript(finalTranscript);
    };

    recognitionRef.current = recognition;
  }, [transcript]);

  // 🎤 Start both recording + speech recognition
  const handleStart = () => {
    startRecording();
    recognitionRef.current && recognitionRef.current.start();
  };

  // ⏹ Stop both
  const handleStop = () => {
    stopRecording();
    recognitionRef.current && recognitionRef.current.stop();
  };

  // 🚀 Handle Generate with Loader
  const handleGenerateClick = async () => {
    if (!audioBlob) return;

    // ✅ close modal immediately
    onClose();

    showLoader();

    try {
      await handleRecordingUpload();
    } catch (err) {
      console.error(err);
    }

    hideLoader();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ textAlign: "center" }}>

        <h2>🎤 Live Recording</h2>

        {/* 🎤 Mic Icon */}
        <div
          style={{
            fontSize: "80px",
            opacity: recording ? 0.5 : 0.2,
            margin: "20px 0"
          }}
        >
          🎙️
        </div>

        {/* 📝 Live Transcript */}
        <div
          style={{
            maxHeight: "120px",
            overflowY: "auto",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            background: "rgba(255,255,255,0.5)",
            fontSize: "14px",
            textAlign: "left",
            marginBottom: "10px"
          }}
        >
          {transcript || "Start speaking... transcript will appear here"}
        </div>

        {/* 🎛 Controls */}
        <div className="modal-actions" style={{ justifyContent: "center" }}>

          {!recording ? (
            <button className="btn-primary" onClick={handleStart}>
              ▶ Start
            </button>
          ) : (
            <button className="btn-secondary" onClick={handleStop}>
              ⏹ Stop
            </button>
          )}

          {audioBlob && (
            <button className="btn-primary" onClick={handleGenerateClick}>
              🚀 Generate
            </button>
          )}

        </div>

        {/* 🎧 Preview */}
        {audioBlob && (
          <audio
            controls
            src={URL.createObjectURL(audioBlob)}
            style={{ marginTop: "15px", width: "100%" }}
          />
        )}

        {/* ❌ Close */}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

export default LiveMicModal;
