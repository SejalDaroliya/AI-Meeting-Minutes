// ─────────────────────────────────────────────
//  MeetPilot AI — HeroVisual.jsx
//  - Smaller sphere
//  - Satellites orbit correctly along the ellipse path
//  - Static concentric rings
//  - Static dashed ellipse orbit tracks
// ─────────────────────────────────────────────

import React, { useEffect, useRef } from "react";

export default function HeroVisual() {
  const sat1Ref = useRef(null);
  const sat2Ref = useRef(null);
  const sat3Ref = useRef(null);
  const sat4Ref = useRef(null);

  useEffect(() => {
    // Center of the SVG
    const cx = 160, cy = 160;

    // Ring 1: rx=118, ry=42, tilt=-28deg
    const r1 = { rx: 118, ry: 42, tilt: -28 * Math.PI / 180 };
    // Ring 2: rx=104, ry=36, tilt=44deg
    const r2 = { rx: 104, ry: 36, tilt: 44 * Math.PI / 180 };

    // Get point on tilted ellipse at angle t
    function ellipsePoint(ring, t) {
      const ex = ring.rx * Math.cos(t);
      const ey = ring.ry * Math.sin(t);
      const x = cx + ex * Math.cos(ring.tilt) - ey * Math.sin(ring.tilt);
      const y = cy + ex * Math.sin(ring.tilt) + ey * Math.cos(ring.tilt);
      return { x, y };
    }

    let animId;
    let startTime = null;

    function animate(ts) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000; // seconds

      // Ring1 satellites — period 9s, opposite phase
      const t1a = (elapsed / 9) * 2 * Math.PI;
      const t1b = t1a + Math.PI;

      // Ring2 satellites — period 14s (reverse), opposite phase
      const t2a = -(elapsed / 14) * 2 * Math.PI;
      const t2b = t2a + Math.PI;

      const p1 = ellipsePoint(r1, t1a);
      const p2 = ellipsePoint(r1, t1b);
      const p3 = ellipsePoint(r2, t2a);
      const p4 = ellipsePoint(r2, t2b);

      if (sat1Ref.current) sat1Ref.current.setAttribute("transform", `translate(${p1.x}, ${p1.y})`);
      if (sat2Ref.current) sat2Ref.current.setAttribute("transform", `translate(${p2.x}, ${p2.y})`);
      if (sat3Ref.current) sat3Ref.current.setAttribute("transform", `translate(${p3.x}, ${p3.y})`);
      if (sat4Ref.current) sat4Ref.current.setAttribute("transform", `translate(${p4.x}, ${p4.y})`);

      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className="hero-visual"
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <style>{`
        @keyframes mpFloat {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-9px);  }
        }
        @keyframes mpPulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.5; }
        }
        .mp-orb-group {
          animation: mpFloat 5s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .mp-sat-pink { animation: mpPulse 2.2s ease-in-out infinite; }
        .mp-sat-blue { animation: mpPulse 2.2s ease-in-out infinite 0.7s; }
        .mp-sat-pink2 { animation: mpPulse 2.2s ease-in-out infinite 1.1s; }
        .mp-sat-pink3 { animation: mpPulse 2.2s ease-in-out infinite 1.6s; }
      `}</style>

      <svg
        viewBox="0 0 320 320"
        xmlns="http://www.w3.org/2000/svg"
        width="280"
        height="280"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Sphere gradient — deep purple, bright top-left highlight */}
          <radialGradient id="mpSphere" cx="34%" cy="26%" r="68%">
            <stop offset="0%"   stopColor="#9b5fff" />
            <stop offset="30%"  stopColor="#6d28d9" />
            <stop offset="68%"  stopColor="#3b0764" />
            <stop offset="100%" stopColor="#120420" />
          </radialGradient>

          {/* Specular sheen */}
          <radialGradient id="mpSpec" cx="28%" cy="20%" r="46%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.45" />
            <stop offset="55%"  stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0"    />
          </radialGradient>

          {/* Ambient glow behind sphere */}
          <radialGradient id="mpGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.45" />
            <stop offset="60%"  stopColor="#5b21b6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0"    />
          </radialGradient>

          {/* Pink satellite */}
          <radialGradient id="mpPink" cx="32%" cy="32%" r="68%">
            <stop offset="0%"   stopColor="#ffb8d8" />
            <stop offset="100%" stopColor="#e91e7a" />
          </radialGradient>

          {/* Blue satellite */}
          <radialGradient id="mpBlue" cx="32%" cy="32%" r="68%">
            <stop offset="0%"   stopColor="#d4c5ff" />
            <stop offset="100%" stopColor="#7b6fcd" />
          </radialGradient>

          {/* Satellite bloom */}
          <filter id="mpBloom" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Sphere soft glow */}
          <filter id="mpSphGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── CONCENTRIC STATIC HALO RINGS ── */}
        <circle cx="160" cy="160" r="148" fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity="0.2" />
        <circle cx="160" cy="160" r="132" fill="none" stroke="#a78bfa" strokeWidth="0.6" opacity="0.25" />
        <circle cx="160" cy="160" r="116" fill="none" stroke="#a78bfa" strokeWidth="0.7" opacity="0.3" />
        <circle cx="160" cy="160" r="100" fill="none" stroke="#a78bfa" strokeWidth="0.8" opacity="0.3" />
        <circle cx="160" cy="160" r="84"  fill="none" stroke="#a78bfa" strokeWidth="0.9" opacity="0.25" />

        {/* ── STATIC DASHED ORBIT TRACKS ── */}
        {/* Track 1 — tilt -28° */}
        <ellipse
          cx="160" cy="160"
          rx="118" ry="42"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="1.1"
          strokeDasharray="7 5"
          opacity="0.45"
          transform="rotate(-28 160 160)"
        />
        {/* Track 2 — tilt 44° */}
        <ellipse
          cx="160" cy="160"
          rx="104" ry="36"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="1"
          strokeDasharray="6 5"
          opacity="0.38"
          transform="rotate(44 160 160)"
        />

        {/* ── SPHERE ── */}
        <g className="mp-orb-group">
          {/* Ambient bloom */}
          <circle cx="160" cy="160" r="84" fill="url(#mpGlow)" />

          {/* Main sphere */}
          <circle cx="160" cy="160" r="68" fill="url(#mpSphere)" filter="url(#mpSphGlow)" />

          {/* Specular */}
          <circle cx="160" cy="160" r="68" fill="url(#mpSpec)" />

          {/* Rim */}
          <circle cx="160" cy="160" r="68" fill="none" stroke="white" strokeWidth="1" opacity="0.09" />

          {/* ── MP MONOGRAM ── */}
          {/* M */}
          <path
            d="M126 182 L126 138 L147 164 L168 138 L168 182"
            fill="none"
            stroke="white"
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* P stem */}
          <path
            d="M177 182 L177 138"
            fill="none"
            stroke="white"
            strokeWidth="4.8"
            strokeLinecap="round"
          />
          {/* P bowl */}
          <path
            d="M177 138 Q200 138 200 153 Q200 168 177 168"
            fill="none"
            stroke="white"
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ── SATELLITES (positioned by JS rAF) ── */}

        {/* Ring 1 — satellite A (pink) */}
        <g ref={sat1Ref} className="mp-sat-pink" filter="url(#mpBloom)">
          <circle cx="0" cy="0" r="13" fill="#e91e7a" opacity="0.15" />
          <circle cx="0" cy="0" r="7"  fill="url(#mpPink)" />
          <circle cx="-2" cy="-2" r="2.4" fill="white" opacity="0.72" />
        </g>

        {/* Ring 1 — satellite B (blue) */}
        <g ref={sat2Ref} className="mp-sat-blue" filter="url(#mpBloom)">
          <circle cx="0" cy="0" r="11" fill="#6d28d9" opacity="0.15" />
          <circle cx="0" cy="0" r="6"  fill="url(#mpBlue)" />
          <circle cx="-1.5" cy="-1.5" r="2" fill="white" opacity="0.65" />
        </g>

        {/* Ring 2 — satellite C (larger pink) */}
        <g ref={sat3Ref} className="mp-sat-pink2" filter="url(#mpBloom)">
          <circle cx="0" cy="0" r="14" fill="#e91e7a" opacity="0.18" />
          <circle cx="0" cy="0" r="8"  fill="url(#mpPink)" />
          <circle cx="-2" cy="-2" r="2.8" fill="white" opacity="0.7" />
        </g>

        {/* Ring 2 — satellite D (small pink) */}
        <g ref={sat4Ref} className="mp-sat-pink3" filter="url(#mpBloom)">
          <circle cx="0" cy="0" r="10" fill="#e91e7a" opacity="0.15" />
          <circle cx="0" cy="0" r="5.5" fill="url(#mpPink)" />
          <circle cx="-1.5" cy="-1.5" r="1.8" fill="white" opacity="0.65" />
        </g>
      </svg>
    </div>
  );
}