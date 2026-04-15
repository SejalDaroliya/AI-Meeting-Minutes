import React from "react";
import "../styles/Loader.css";

function Loader() {
  return (
    <div className="loader-overlay">
      <div className="spinner"></div>
      <p>Processing meeting... ⏳</p>
    </div>
  );
}

export default Loader;