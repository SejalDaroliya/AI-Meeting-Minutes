import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LiveRecording.css";
import { useLoader } from "../context/LoaderContext";

function LiveRecording() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_URL;
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [meetingTitle, setMeetingTitle] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [inputMode, setInputMode] = useState("live");
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioLevels, setAudioLevels] = useState(new Array(30).fill(5));
  const [liveTranscript, setLiveTranscript] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const { showLoader, hideLoader } = useLoader();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const visualize = (stream) => {
    const audioContext =
      new (window.AudioContext || window.webkitAudioContext)();

    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);

      const levels = [];
      const step = Math.floor(dataArray.length / 30);

      for (let i = 0; i < 30; i++) {
        const value = dataArray[i * step];
        const normalized = Math.max(5, (value / 255) * 50);
        levels.push(normalized);
      }

      setAudioLevels(levels);
      animationRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();
  };

  const startRecording = async () => {
    try {
      finalTranscriptRef.current = "";
      setLiveTranscript("");
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });

        setAudioBlob(blob);

        stream.getTracks().forEach((track) => track.stop());

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        setAudioLevels(new Array(30).fill(5));
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      visualize(stream);

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        showToast("Live transcription not supported in this browser");
        return;
      }

      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
  let interimTranscript = "";
  let finalTranscript = finalTranscriptRef.current;

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;

    if (event.results[i].isFinal) {
      finalTranscript += transcript + " ";
    } else {
      interimTranscript += transcript;
    }
  }

  finalTranscriptRef.current = finalTranscript;
  setLiveTranscript((finalTranscript + interimTranscript).trim());
};

      recognition.onend = () => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error(err);
      showToast(
        "Microphone access denied. Please allow microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }

    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const uploadAudio = async (file) => {
    if (!file) return showToast("No file found");

    const formData = new FormData();
    const fileName = meetingTitle || "recording";

    formData.append("file", file, `${fileName}.mp3`);
    formData.append("user_id", storedUser.user_id);
    formData.append("title", fileName);
    formData.append("participants", JSON.stringify([]));

    const res = await fetch(`${BASE_URL}/process-audio`, {
      method: "POST",
      body: formData,
    });

    return await res.json();
  };

  const handleGenerate = async () => {
    if (!meetingTitle.trim()) {
      showToast("Please enter a meeting title first");
      return;
    }

    const fileToUpload =
      inputMode === "live" ? audioBlob : selectedFile;

    if (!fileToUpload) {
      showToast(
        inputMode === "live"
          ? "Please record audio first"
          : "Please upload a file first"
      );
      return;
    }

    showLoader();

    try {
      const result = await uploadAudio(fileToUpload);

      if (result.success) {
        navigate("/summary", { state: result });
      } else {
        showToast("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      showToast("Error generating summary");
    }

    hideLoader();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current)
        cancelAnimationFrame(animationRef.current);
      if (recognitionRef.current)
        recognitionRef.current.stop();
    };
  }, []);

  return (
    <div className="live-recording-page">
      <button
        className="back-btn"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <div className="live-recording-container">
        {/* MAIN */}
        <div className="recording-main">
          <h1 className="page-title">Record or Upload</h1>

          <p className="page-subtitle">
            Capture a meeting live or upload a recording —
            AI handles transcript, summary, action items, and report.
          </p>

          <div className="recording-card">
            <input
              type="text"
              className="meeting-title-input"
              placeholder="Meeting title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />

            <div className="divider"></div>

            <div className="mode-toggle">
              <button
                className={`mode-btn ${
                  inputMode === "live" ? "active" : ""
                }`}
                onClick={() => setInputMode("live")}
              >
                Live recording
              </button>

              <button
                className={`mode-btn ${
                  inputMode === "upload" ? "active" : ""
                }`}
                onClick={() => setInputMode("upload")}
              >
                Upload file
              </button>
            </div>

            {inputMode === "live" && (
              <div className="live-recording-ui">
                <div
                  className={`mic-button ${
                    recording ? "recording" : ""
                  }`}
                  onClick={
                    recording ? stopRecording : startRecording
                  }
                >
                  <div className="mic-icon">🎤</div>
                  {recording && <div className="pulse-ring"></div>}
                </div>

                <div className="timer">
                  {formatTime(recordingTime)}
                </div>

                <p className="mic-instruction">
                  {recording
                    ? "Recording... Click to stop"
                    : "Tap the mic to start"}
                </p>

                <div className="waveform">
                  {audioLevels.map((level, index) => (
                    <div
                      key={index}
                      className="waveform-bar"
                      style={{ height: `${level}px` }}
                    ></div>
                  ))}
                </div>

                {(recording || liveTranscript) && (
  <div className="transcript-box">
    <h3>Live Transcript</h3>
    <p>
      {liveTranscript || "Listening... start speaking"}
    </p>
  </div>
)}

                {audioBlob && !recording && (
                  <div className="audio-preview">
                    <audio
                      controls
                      src={URL.createObjectURL(audioBlob)}
                    />
                    <button
                      className="generate-btn"
                      onClick={handleGenerate}
                    >
                      Generate Summary →
                    </button>
                  </div>
                )}
              </div>
            )}

            {inputMode === "upload" && (
              <div className="upload-ui">
                <label className="upload-area">
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={(e) =>
                      setSelectedFile(e.target.files[0])
                    }
                  />
                  <div className="upload-icon">📁</div>
                  <p>Click to upload</p>
                  <span>MP3, WAV, M4A up to 100MB</span>
                </label>

                {selectedFile && (
  <>
    <div className="file-preview">
      <span className="file-name">📁 {selectedFile.name}</span>
      <button
        className="file-remove"
        onClick={() => setSelectedFile(null)}
      >
        ✕
      </button>
    </div>

    <button
      className="generate-btn"
      onClick={handleGenerate}
    >
      Generate Summary →
    </button>
  </>
)}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="recording-sidebar">
          <div className="sidebar-card">
            <h2>What happens next</h2>

            <div className="step">
              <div className="step-icon">📄</div>
              <div className="step-content">
                <h3>Transcript generated</h3>
                <p>Full text with speaker labels and timestamps.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">📝</div>
              <div className="step-content">
                <h3>Summary extracted</h3>
                <p>Key decisions and discussion highlights.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">✅</div>
              <div className="step-content">
                <h3>Action items captured</h3>
                <p>Tasks with owners and priorities.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">📊</div>
              <div className="step-content">
                <h3>Report ready</h3>
                <p>A polished report for sharing instantly.</p>
              </div>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-label">TIP</span>
            <p>
              For better transcripts, record in a quiet room and
              speak clearly. Browser transcription works best in
              Chrome or Edge.
            </p>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default LiveRecording;