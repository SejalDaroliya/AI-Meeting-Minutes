import React from "react";

export default function HeroVisual() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg width="280" height="280" viewBox="0 0 320 320">

        <defs>
          {/* soft background */}
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#f5f3ff" />
          </linearGradient>

          {/* input blocks */}
          <linearGradient id="in1">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          <linearGradient id="in2">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="in3">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          {/* output block */}
          <linearGradient id="out">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          <filter id="shadow">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* BACKGROUND */}
        <circle cx="160" cy="160" r="120" fill="url(#bg)" />

        {/* INPUT BLOCKS (MEETING INPUTS) */}
        <rect x="60" y="90" width="55" height="55" rx="12" fill="url(#in1)" filter="url(#shadow)" />
        <rect x="60" y="170" width="55" height="55" rx="12" fill="url(#in2)" filter="url(#shadow)" />
        <rect x="60" y="250" width="55" height="55" rx="12" fill="url(#in3)" filter="url(#shadow)" />

        {/* SMALL DOTS INSIDE INPUTS */}
        <circle cx="78" cy="118" r="4" fill="white" opacity="0.7" />
        <circle cx="78" cy="198" r="4" fill="white" opacity="0.7" />
        <circle cx="78" cy="278" r="4" fill="white" opacity="0.7" />

        {/* FLOW LINES */}
        <line x1="115" y1="118" x2="185" y2="160" stroke="#a78bfa" strokeWidth="2" opacity="0.5" />
        <line x1="115" y1="198" x2="185" y2="160" stroke="#a78bfa" strokeWidth="2" opacity="0.5" />
        <line x1="115" y1="278" x2="185" y2="160" stroke="#a78bfa" strokeWidth="2" opacity="0.5" />

        {/* OUTPUT BLOCK (AI RESULT) */}
        <rect
          x="185"
          y="130"
          width="90"
          height="90"
          rx="18"
          fill="url(#out)"
          filter="url(#shadow)"
        />

        {/* AI OUTPUT LINES */}
        <rect x="200" y="155" width="60" height="8" rx="4" fill="white" opacity="0.8" />
        <rect x="200" y="172" width="50" height="8" rx="4" fill="white" opacity="0.6" />
        <rect x="200" y="189" width="40" height="8" rx="4" fill="white" opacity="0.4" />

        {/* SMALL “AI DOT” */}
        <circle cx="255" cy="140" r="6" fill="#22c55e" />

      </svg>
    </div>
  );
}