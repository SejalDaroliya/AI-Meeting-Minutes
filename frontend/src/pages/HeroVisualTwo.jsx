import React from "react";

export default function HeroVisual() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg width="280" height="280" viewBox="0 0 320 320">

        <defs>
          {/* soft purple gradient */}
          <linearGradient id="meetingCore" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          {/* card gradient */}
          <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f5f3ff" />
          </linearGradient>

          {/* shadow */}
          <filter id="shadow">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* BACKGROUND SOFT CIRCLE */}
        <circle
          cx="160"
          cy="160"
          r="110"
          fill="#ede9fe"
          opacity="0.6"
        />

        {/* TOP AGENDA CARD */}
        <rect
          x="95"
          y="70"
          width="130"
          height="70"
          rx="14"
          fill="url(#card)"
          filter="url(#shadow)"
        />

        {/* lines inside agenda */}
        <rect x="110" y="90" width="90" height="6" rx="3" fill="#c4b5fd" />
        <rect x="110" y="105" width="70" height="6" rx="3" fill="#ddd6fe" />
        <rect x="110" y="120" width="50" height="6" rx="3" fill="#e9d5ff" />

        {/* CENTER MEETING TABLE */}
        <rect
          x="110"
          y="150"
          width="100"
          height="55"
          rx="16"
          fill="url(#meetingCore)"
          filter="url(#shadow)"
        />

        {/* table highlight */}
        <rect
          x="120"
          y="160"
          width="80"
          height="10"
          rx="5"
          fill="white"
          opacity="0.25"
        />

        {/* PARTICIPANTS (BOTTOM ROW) */}
        {/* Left */}
        <circle cx="120" cy="250" r="14" fill="#f9a8d4" />
        <circle cx="120" cy="250" r="6" fill="#be185d" opacity="0.7" />

        {/* Center */}
        <circle cx="160" cy="250" r="16" fill="#c4b5fd" />
        <circle cx="160" cy="250" r="7" fill="#5b21b6" opacity="0.7" />

        {/* Right */}
        <circle cx="200" cy="250" r="14" fill="#93c5fd" />
        <circle cx="200" cy="250" r="6" fill="#1d4ed8" opacity="0.7" />

        {/* subtle connection line */}
        <line
          x1="120"
          y1="235"
          x2="200"
          y2="235"
          stroke="#a78bfa"
          strokeWidth="2"
          opacity="0.4"
        />

      </svg>
    </div>
  );
}