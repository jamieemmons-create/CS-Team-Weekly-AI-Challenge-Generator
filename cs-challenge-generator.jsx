import { useState } from "react";

const WEEK_LEVELS = {
  1: "beginner", 2: "beginner", 3: "beginner",
  4: "intermediate", 5: "intermediate", 6: "intermediate", 7: "intermediate",
  8: "advanced", 9: "advanced", 10: "advanced"
};

const FOCUS_MAP = {
  random: "any area (CS workflows, productivity, creative design, or data) — surprise us",
  "cs-workflows": "Customer Success workflows (emails, QBRs, follow-ups, customer communication)",
  productivity: "personal productivity and workflow automation",
  creative: "creative work, design, and visual communication",
  data: "data analysis, reporting, and insights"
};

const DEFAULT_EXISTING = "Automated email triggers that send strategic notes to Slack after customer interactions";

export default function App() {
  const [week, setWeek] = useState(1);
  const [focus, setFocus] = useState("random");
  const [existingTools, setExistingTools] = useState(DEFAULT_EXISTING);
  const [showToolsInput, setShowToolsInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const level = WEEK_LEVELS[week];
  const isComplex = level === "advanced" || (level === "intermediate" && week >= 6);

  async function generateChallenge() {
    setLoading(true);
    setChallenge(null);
    setError(null);
    setCopied(false);

    const prompt = `You are creating a weekly AI challenge for a Customer Success team to build their Claude.ai skills.

Challenge parameters:
- Week: ${week}
- Skill level: ${level}
- Focus area: ${FOCUS_MAP[focus]}
- Needs full walkthrough: ${isComplex}
- Tools/automations the team ALREADY HAS (do NOT suggest these): ${existingTools || "none specified"}

Return ONLY a JSON object (no markdown, no backticks) with this exact structure:
{
  "title": "Catchy challenge title (5-8 words)",
  "category": "One of: CS Workflows | Productivity | Creative & Design | Data & Reporting",
  "level": "${level}",
  "description": "2-3 sentence description of what they'll build/do and why it's useful for CS. Keep it exciting and concrete.",
  "starterPrompt": "The exact prompt they should paste into Claude.ai. Should be detailed, specific, and immediately usable. 3-6 sentences.",
  "steps": ${isComplex ? '["Step 1 text", "Step 2 text", "Step 3 text", "Step 4 text", "Step 5 text"]' : "[]"},
  "proTip": "One actionable tip for getting better results or taking it further. 1-2 sentences.",
  "slackMessage": "A ready-to-paste Slack message for #cs-internal. Start with an emoji, include the challenge name, a 1-sentence hook, the starter prompt in quotes, and a fun CTA. Keep it energetic and under 200 words. Use line breaks for readability. End with a note that free Claude.ai accounts work fine for this."
}

Make the challenge specific, practical, and something a CS person would actually use daily. Week ${week} should feel ${level === "beginner" ? "simple — quick wins that build confidence" : level === "intermediate" ? "creative — combining concepts in useful ways" : "ambitious — pushing what Claude can really do"}. Do NOT suggest anything similar to the tools/automations already listed.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content.map(i => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      setChallenge(JSON.parse(clean));
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copySlack() {
    if (!challenge) return;
    navigator.clipboard.writeText(challenge.slackMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const levelColors = {
    beginner: { bg: "rgba(110,255,212,0.1)", border: "rgba(110,255,212,0.3)", text: "#6effd4" },
    intermediate: { bg: "rgba(255,200,110,0.1)", border: "rgba(255,200,110,0.3)", text: "#ffc86e" },
    advanced: { bg: "rgba(255,110,124,0.1)", border: "rgba(255,110,124,0.3)", text: "#ff6e7c" }
  };
  const lc = levelColors[level];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e8f0",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      backgroundImage: "linear-gradient(rgba(124,110,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,110,255,0.04) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      padding: "0 0 60px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        select, button, textarea { font-family: 'DM Mono', monospace; }
        select option { background: #13131a; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }
        .gen-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 32px rgba(124,110,255,0.4) !important; }
        .gen-btn:active { transform: translateY(0px) !important; }
        .copy-btn:hover { background: #611f69 !important; }
        .tool-toggle:hover { color: #7c6eff !important; }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(124,110,255,0.12)", border: "1px solid rgba(124,110,255,0.3)",
            borderRadius: 100, padding: "6px 14px", fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "#7c6eff", marginBottom: 20
          }}>
            <span style={{ width: 6, height: 6, background: "#7c6eff", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
            CS Team · Claude.ai
          </div>
          <h1 style={{
            fontFamily: "Syne, sans-serif", fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 12
          }}>
            Weekly AI<br />
            <span style={{ background: "linear-gradient(135deg, #7c6eff, #ff6e7c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Challenge Generator
            </span>
          </h1>
          <p style={{ color: "#6b6b80", fontSize: 13, lineHeight: 1.7, maxWidth: 520 }}>
            Generate a fresh AI challenge each week — beginner prompts stay simple, advanced ones come with full walkthroughs. Works with free Claude.ai accounts.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[
            {
              label: "Focus Area", id: "focus", value: focus, onChange: e => setFocus(e.target.value),
              options: [
                { value: "random", label: "🎲 Surprise me" },
                { value: "cs-workflows", label: "📧 CS Workflows" },
                { value: "productivity", label: "⚡ Productivity & Automation" },
                { value: "creative", label: "🎨 Creative & Design" },
                { value: "data", label: "📊 Data & Reporting" }
              ]
            },
            {
              label: "Week Number", id: "week", value: week, onChange: e => setWeek(parseInt(e.target.value)),
              options: [
                { value: 1, label: "Week 1 — Beginner" }, { value: 2, label: "Week 2 — Beginner" },
                { value: 3, label: "Week 3 — Beginner" }, { value: 4, label: "Week 4 — Intermediate" },
                { value: 5, label: "Week 5 — Intermediate" }, { value: 6, label: "Week 6 — Intermediate" },
                { value: 7, label: "Week 7 — Intermediate+" }, { value: 8, label: "Week 8 — Advanced" },
                { value: 9, label: "Week 9 — Advanced" }, { value: 10, label: "Week 10 — Advanced" }
              ]
            }
          ].map(ctrl => (
            <div key={ctrl.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6b80" }}>{ctrl.label}</label>
              <select value={ctrl.value} onChange={ctrl.onChange} style={{
                background: "#13131a", border: "1px solid #2a2a3a", color: "#e8e8f0",
                padding: "10px 36px 10px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6b80' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center"
              }}>
                {ctrl.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Existing tools toggle */}
        <div style={{ marginBottom: 24 }}>
          <button className="tool-toggle" onClick={() => setShowToolsInput(!showToolsInput)} style={{
            background: "none", border: "none", color: "#6b6b80", fontSize: 12,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, transition: "color 0.15s"
          }}>
            <span style={{ fontSize: 10 }}>{showToolsInput ? "▼" : "▶"}</span>
            Tell it what your team already has (so it doesn't suggest redundant challenges)
          </button>
          {showToolsInput && (
            <div style={{ marginTop: 10 }}>
              <textarea
                value={existingTools}
                onChange={e => setExistingTools(e.target.value)}
                placeholder="e.g. automated Slack notes from emails, QBR templates, etc."
                style={{
                  width: "100%", background: "#13131a", border: "1px solid #2a2a3a",
                  borderLeft: "3px solid #7c6eff", color: "#e8e8f0", padding: "12px 14px",
                  borderRadius: 8, fontSize: 12, lineHeight: 1.6, resize: "vertical",
                  minHeight: 80, outline: "none"
                }}
              />
            </div>
          )}
        </div>

        {/* Generate button */}
        <button className="gen-btn" onClick={generateChallenge} disabled={loading} style={{
          width: "100%", padding: "16px", background: "linear-gradient(135deg, #7c6eff, #5b4fd4)",
          border: "none", borderRadius: 10, color: "white", fontSize: 15,
          fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.02em",
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
          marginBottom: 28, transition: "transform 0.15s, box-shadow 0.15s"
        }}>
          {loading ? "⏳ Generating..." : "⚡ Generate This Week's Challenge"}
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "32px", color: "#6b6b80", fontSize: 13 }}>
            <div style={{ width: 20, height: 20, border: "2px solid #2a2a3a", borderTopColor: "#7c6eff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Crafting your challenge...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,110,124,0.08)", border: "1px solid rgba(255,110,124,0.2)", borderRadius: 10, padding: "14px 18px", color: "#ff6e7c", fontSize: 13, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Challenge card */}
        {challenge && (
          <div style={{ background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 16, overflow: "hidden", animation: "slideUp 0.4s ease" }}>

            {/* Card header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #2a2a3a", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ padding: "4px 10px", borderRadius: 100, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: lc.bg, border: `1px solid ${lc.border}`, color: lc.text }}>
                  {challenge.level}
                </span>
                <span style={{ padding: "4px 10px", background: "rgba(124,110,255,0.1)", border: "1px solid rgba(124,110,255,0.2)", borderRadius: 100, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c6eff" }}>
                  {challenge.category}
                </span>
              </div>
              <span style={{ fontSize: 11, color: "#6b6b80" }}>Week {week}</span>
            </div>

            {/* Card body */}
            <div style={{ padding: "28px 24px" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>{challenge.title}</div>
              <div style={{ color: "#a0a0b8", fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>{challenge.description}</div>

              {/* Starter prompt */}
              <SectionLabel>Starter Prompt for Claude.ai</SectionLabel>
              <div style={{ background: "#1c1c27", border: "1px solid #2a2a3a", borderLeft: "3px solid #7c6eff", borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 1.7, marginBottom: 24, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {challenge.starterPrompt}
              </div>

              {/* Steps (complex only) */}
              {challenge.steps && challenge.steps.length > 0 && (
                <>
                  <SectionLabel>Step-by-Step Walkthrough</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    {challenge.steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <div style={{ width: 24, height: 24, minWidth: 24, background: "rgba(124,110,255,0.15)", border: "1px solid rgba(124,110,255,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#7c6eff", fontWeight: 600, marginTop: 1 }}>{i + 1}</div>
                        <div style={{ fontSize: 13, lineHeight: 1.6, color: "#a0a0b8" }}>{step}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Pro tip */}
              <SectionLabel>Pro Tip</SectionLabel>
              <div style={{ background: "rgba(110,255,212,0.05)", border: "1px solid rgba(110,255,212,0.15)", borderRadius: 8, padding: "14px 16px", fontSize: 13, lineHeight: 1.6, color: "#8af0d4" }}>
                {challenge.proTip}
              </div>
            </div>

            {/* Slack section */}
            <div style={{ borderTop: "1px solid #2a2a3a", padding: 24, background: "rgba(74,21,75,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a77baa" }}>
                  <SlackIcon />
                  Ready to drop in #cs-internal
                </div>
                <button className="copy-btn" onClick={copySlack} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: copied ? "rgba(110,255,212,0.15)" : "#4a154b",
                  border: copied ? "1px solid rgba(110,255,212,0.3)" : "1px solid #611f69",
                  color: copied ? "#6effd4" : "#e8d4e8",
                  padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", transition: "background 0.15s"
                }}>
                  {copied ? "✓ Copied!" : "📋 Copy Message"}
                </button>
              </div>
              <div style={{ background: "#1a1a1a", border: "1px solid #2d1f2e", borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 1.7, color: "#d4d4d4", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 220, overflowY: "auto" }}>
                {challenge.slackMessage}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6b80", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
      {children}
      <div style={{ flex: 1, height: 1, background: "#2a2a3a" }} />
    </div>
  );
}

function SlackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9.07 15.56C9.07 16.62 8.21 17.48 7.15 17.48C6.09 17.48 5.23 16.62 5.23 15.56C5.23 14.5 6.09 13.64 7.15 13.64H9.07V15.56Z" fill="#E01E5A"/>
      <path d="M10.04 15.56C10.04 14.5 10.9 13.64 11.96 13.64C13.02 13.64 13.88 14.5 13.88 15.56V20.37C13.88 21.43 13.02 22.29 11.96 22.29C10.9 22.29 10.04 21.43 10.04 20.37V15.56Z" fill="#E01E5A"/>
      <path d="M11.96 8.45C10.9 8.45 10.04 7.59 10.04 6.53C10.04 5.47 10.9 4.61 11.96 4.61C13.02 4.61 13.88 5.47 13.88 6.53V8.45H11.96Z" fill="#36C5F0"/>
      <path d="M11.96 9.42C13.02 9.42 13.88 10.28 13.88 11.34C13.88 12.4 13.02 13.26 11.96 13.26H7.15C6.09 13.26 5.23 12.4 5.23 11.34C5.23 10.28 6.09 9.42 7.15 9.42H11.96Z" fill="#36C5F0"/>
      <path d="M18.86 11.34C18.86 10.28 19.72 9.42 20.78 9.42C21.84 9.42 22.7 10.28 22.7 11.34C22.7 12.4 21.84 13.26 20.78 13.26H18.86V11.34Z" fill="#2EB67D"/>
      <path d="M17.89 11.34C17.89 12.4 17.03 13.26 15.97 13.26C14.91 13.26 14.05 12.4 14.05 11.34V6.53C14.05 5.47 14.91 4.61 15.97 4.61C17.03 4.61 17.89 5.47 17.89 6.53V11.34Z" fill="#2EB67D"/>
      <path d="M15.97 18.45C17.03 18.45 17.89 19.31 17.89 20.37C17.89 21.43 17.03 22.29 15.97 22.29C14.91 22.29 14.05 21.43 14.05 20.37V18.45H15.97Z" fill="#ECB22E"/>
      <path d="M15.97 17.48C14.91 17.48 14.05 16.62 14.05 15.56C14.05 14.5 14.91 13.64 15.97 13.64H20.78C21.84 13.64 22.7 14.5 22.7 15.56C22.7 16.62 21.84 17.48 20.78 17.48H15.97Z" fill="#ECB22E"/>
    </svg>
  );
}
