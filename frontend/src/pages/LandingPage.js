import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How does the AI generate meeting summaries?",
      answer:
        "MeetPilot transcribes your audio, separates speakers, and then processes the transcript through an AI model trained to extract decisions, blockers, and follow-ups."
    },
    {
      question: "Is my meeting data private and secure?",
      answer:
        "Yes. Your uploaded files and transcripts are processed securely, and access is restricted to authorized users only."
    },
    {
      question: "What audio and video formats are supported?",
      answer:
        "MP3, WAV, MP4, and most standard meeting exports are supported for transcription and summarization."
    },
    {
      question: "Can I edit the AI-generated report before sharing?",
      answer:
        "Absolutely. Reports can be reviewed, edited, and then shared via email or exported for team collaboration.",
    },
    {
      question: "Does it support multiple speakers and group calls?",
      answer:
        "Yes. Speaker detection is built in. The transcript is labelled by speaker, and the summary attributes decisions and tasks to the right person — perfect for stand-ups, client calls, and lecture recordings."
    },
    {
      question: "Is there a free plan for students?",
      answer:
        "Yes. Every student team gets unlimited meetings on the free plan during this academic year. No credit card, no usage caps — built by students, for students."
    },
  ];

  const [openIndex, setOpenIndex] = useState();

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">AI Meeting Minutes</div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#footer">About</a>
          <button
            className="start-btn"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-left">
          <p className="hero-tag">AI MEETING MINUTES, REIMAGINED</p>

          <h1>
            Stop taking notes. <span>Start smart conversations.</span>
          </h1>

          <p className="hero-subtext">
            Automatically transform your meetings into polished summaries,
            action items, and structured reports with AI-powered intelligence.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Get Started — it’s free
            </button>

            <button className="secondary-btn" onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({
                behavior: "smooth"
              });
            }}>
              See how it works
            </button>
          </div>

          <p className="hero-note">
            No credit card required • Built for student and enterprise teams
          </p>
        </div>

        <div className="hero-right">
          <div className="mockup-card transcript-card">
            <span className="small-label">LIVE TRANSCRIPT</span>
            <p><strong>Speaker 1:</strong> Let’s finalize the roadmap.</p>
            <p><strong>Speaker 2:</strong> AI summary should include decisions.</p>
            <p><strong>Speaker 3:</strong> Action items assigned clearly.</p>
          </div>

          <div className="arrow-icon">↓</div>

          <div className="mockup-card summary-card">
            <span className="small-label">AI SUMMARY</span>
            <h4>Project Sync — Meeting Minutes</h4>
            <ul>
              <li>Roadmap finalized for next sprint</li>
              <li>AI report export added</li>
              <li>Tasks assigned to team members</li>
            </ul>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <h2>Better notes. Faster reviews. Zero meeting fatigue.</h2>

        <div className="stats-grid">
          <div>
            <h3>50%</h3>
            <p>More accurate notes</p>
          </div>

          <div>
            <h3>3x</h3>
            <p>Faster post-meeting review</p>
          </div>

          <div>
            <h3>10+</h3>
            <p>Hours saved weekly</p>
          </div>

          <div>
            <h3>100%</h3>
            <p>Data privacy maintained</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <h2>Everything your team needs after the call</h2>
        <p>
          Three powerful modules that transform long discussions into
          actionable business outcomes.
        </p>

        <div className="feature-showcase">

          {/* Feature 1 */}
          <div className="showcase-row">
            <div className="showcase-text">
              <p className="feature-label">01 — TRANSCRIPTION</p>
              <h3>AI Transcription</h3>
              <p>
                Convert meeting audio into searchable, speaker-labeled text with
                real-time clarity and structured output.
              </p>
            </div>

            <div className="wave-card">
              <div className="wave-header">
                <div className="record-dot"></div>
                <div>
                  <h4>Recording</h4>
                  <p>3 speakers detected</p>
                </div>
              </div>

              <div className="wave-bars">
                {[...Array(20)].map((_, i) => (
                  <span
                    key={i}
                    className="bar"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  ></span>
                ))}
              </div>
              <div className="speaker-lines">
                <p><span>A</span> So the metrics row goes right under the hero, agreed?</p>
                <p><span>B</span> Yes, with four big numbers in purple.</p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="showcase-row">
            <div className="showcase-text">
              <p className="feature-label">02 — SUMMARIES</p>
              <h3>Smart Summaries</h3>
              <p>
                Generate concise reports, decisions, and action items instantly
                using AI-powered contextual understanding.
              </p>
            </div>
            <div className="summary-demo-card">
              <span className="small-label">AI SUMMARY</span>
              <h4>Weekly Team Sync</h4>
              <ul>
                <li>Project roadmap finalized</li>
                <li>Testing phase starts Monday</li>
                <li>Responsibilities assigned</li>
              </ul>
            </div>

            
          </div>

          {/* Feature 3 */}
          <div className="showcase-row">
            <div className="showcase-text">
              <p className="feature-label">03 — DELIVERY</p>
              <h3>Share Reports</h3>
              <p>
                Deliver polished meeting reports to your team with one-click email
                sharing and collaborative access.
              </p>
            </div>

            <div className="email-demo-card">
              <span className="small-label">EMAIL DELIVERY</span>
              <h4>Meeting Report Sent</h4>
              <p>To: team@company.com</p>
              <div className="sent-badge">✔ Successfully Delivered</div>
            </div>
          </div>

        </div>
      </section>

      {/* Why it Matters */}
      <section className="features-section" id="features">
        <h6>WHY IT MATTERS</h6>
        <h2>
          Built for the way teams actually meet
        </h2>
        <div className="why-matters-grid">
          <div className="email-demo-card">
            <h3>Focus on the conversation, not the notes</h3>
            <p>Stop scribbling. Be present in the discussion while
              MeetPilot listens, transcribes, and structures everything for you.</p>
          </div>
          <div className="email-demo-card">
            <h3>Save hours every single week</h3>
            <p>Skip the cleanup. Get a polished summary,
              decisions, and action items in under a minute after the call ends.</p>
          </div>
          <div className="email-demo-card">
            <h3>Keep your team perfectly aligned</h3>
            <p>Share a clean report with one click. Everyone reads the same takeaways and
              the same to-do list — no drift.</p>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="how-section" id="how-it-works">
        <p className="section-tag">HOW IT WORKS</p>
        <h2>From recording to report in three steps</h2>
        <p className="section-subtext">
          No setup, no plugins. Just record, wait a moment, and share.
        </p>

        <div className="steps-grid">

          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Record or upload your meeting</h3>
            <p>
              Hit record in the browser, drop in an MP3, or upload a Zoom export.
              We handle the rest.
            </p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Our AI transcribes and summarises</h3>
            <p>
              Speaker-aware transcription, then a structured summary with key
              points and assigned action items.
            </p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Share the report or send by email</h3>
            <p>
              Edit if you need to, then send a clean, branded report to your team
              in a single click.
            </p>
          </div>

        </div>
      </section>
      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <p className="section-tag">QUESTIONS, ANSWERED</p>
        <h2>Everything you might be wondering</h2>
        <p className="section-subtext">
          Can’t find what you're looking for? Reach out — our team replies within a
          working day.
        </p>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? "active" : ""}`}
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              <div className="faq-question">
                <h6>{faq.question}</h6>
                <span>{openIndex === index ? "⌃" : "⌄"}</span>
              </div>

              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="footer">
        <h3>AI Meeting Minutes</h3>
        <p>Final Year Project – AI & Data Science</p>

        <div className="team">
          <h4>Team Members</h4>
          <p>• Sejal Daroliya</p>
          <p>• Shraddha Mehra</p>
          <p>• Udai Pratap Singh Jhala</p>
          <p>• Yashi Sharma</p>
          <p>• Vishal Tank</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;