import { useState, useRef } from "react";

const W = 900, H = 1100;
const cx = W / 2, cy = H / 2;

function fieldColor(norm) {
  const hue = Math.round(260 - norm * 80);
  const sat = 70 + norm * 25;
  const light = 30 + norm * 28;
  return `hsl(${hue},${sat}%,${light}%)`;
}

function drawOpalPearl(ctx, pearlRadius) {
  const base = ctx.createRadialGradient(
    cx - pearlRadius * 0.2, cy - pearlRadius * 0.25, 0,
    cx, cy, pearlRadius
  );
  base.addColorStop(0, "rgba(255,255,255,1)");
  base.addColorStop(0.3, "rgba(245,243,252,1)");
  base.addColorStop(0.65, "rgba(228,235,248,1)");
  base.addColorStop(1, "rgba(208,220,238,1)");
  ctx.beginPath();
  ctx.arc(cx, cy, pearlRadius, 0, 2 * Math.PI);
  ctx.fillStyle = base;
  ctx.fill();

  const washes = [
    { dx: -0.3, dy: -0.3, r: 0.70, color: "rgba(190,220,255,0.30)" },
    { dx: 0.3, dy: -0.1, r: 0.60, color: "rgba(255,210,240,0.22)" },
    { dx: -0.1, dy: 0.4, r: 0.65, color: "rgba(190,255,230,0.20)" },
    { dx: 0.25, dy: 0.3, r: 0.55, color: "rgba(255,242,185,0.16)" },
    { dx: -0.2, dy: 0.1, r: 0.50, color: "rgba(215,195,255,0.22)" },
  ];
  washes.forEach(({ dx, dy, r, color }) => {
    const gx = cx + dx * pearlRadius, gy = cy + dy * pearlRadius;
    const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * pearlRadius);
    gr.addColorStop(0, color);
    gr.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, pearlRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gr;
    ctx.fill();
  });

  const spec = ctx.createRadialGradient(
    cx - pearlRadius * 0.28, cy - pearlRadius * 0.32, 0,
    cx - pearlRadius * 0.18, cy - pearlRadius * 0.22, pearlRadius * 0.45
  );
  spec.addColorStop(0, "rgba(255,255,255,0.95)");
  spec.addColorStop(0.35, "rgba(255,255,255,0.32)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, pearlRadius, 0, 2 * Math.PI);
  ctx.fillStyle = spec;
  ctx.fill();

  const spec2 = ctx.createRadialGradient(
    cx + pearlRadius * 0.3, cy + pearlRadius * 0.32, 0,
    cx + pearlRadius * 0.3, cy + pearlRadius * 0.32, pearlRadius * 0.35
  );
  spec2.addColorStop(0, "rgba(255,255,255,0.48)");
  spec2.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, pearlRadius, 0, 2 * Math.PI);
  ctx.fillStyle = spec2;
  ctx.fill();

  const rim = ctx.createRadialGradient(cx, cy, pearlRadius * 0.78, cx, cy, pearlRadius);
  rim.addColorStop(0, "rgba(170,185,210,0)");
  rim.addColorStop(1, "rgba(130,150,185,0.38)");
  ctx.beginPath();
  ctx.arc(cx, cy, pearlRadius, 0, 2 * Math.PI);
  ctx.fillStyle = rim;
  ctx.fill();

  ctx.save();
  ctx.shadowColor = "rgba(80,100,140,0.30)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, pearlRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(170,185,215,0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function getBBox(ctx, text, x, y, size) {
  ctx.font = `${size}px Georgia, serif`;
  const w = ctx.measureText(text).width + 8;
  const h = size * 1.1;
  return { x1: x - w / 2, y1: y - h, x2: x + w / 2, y2: y + 4 };
}

function anyOverlap(box, placed, pad = 6) {
  return placed.some(b =>
    box.x1 - pad < b.x2 && box.x2 + pad > b.x1 &&
    box.y1 - pad < b.y2 && box.y2 + pad > b.y1
  );
}

function renderVisualization(canvas, topic, wordData, studentWords) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const placedBoxes = [];
  const pearlRadius = 120 + Math.min(studentWords.length, 8) * 10;

  drawOpalPearl(ctx, pearlRadius);

  studentWords.forEach((word, i) => {
    const size = i === 0 ? 34 : Math.round(13 + (1 - i / studentWords.length) * 13);
    const alpha = i === 0 ? 1 : 0.72 + (1 - i / studentWords.length) * 0.28;
    if (i === 0) {
      ctx.save();
      ctx.font = `bold ${size}px Georgia, serif`;
      ctx.fillStyle = "#08121a";
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(word, cx, cy);
      ctx.restore();
      placedBoxes.push(getBBox(ctx, word, cx, cy, size));
      return;
    }
    const maxR = pearlRadius - size - 10;
    let placed = false;
    for (let ring = 1; ring <= 12 && !placed; ring++) {
      const r = (ring / 12) * maxR;
      const steps = Math.max(8, ring * 6);
      const offset = (i * 1.3) % (2 * Math.PI);
      for (let s = 0; s < steps && !placed; s++) {
        const angle = offset + (s / steps) * 2 * Math.PI;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (Math.hypot(x - cx, y - cy) + size > pearlRadius - 8) continue;
        const box = getBBox(ctx, word, x, y, size);
        if (!anyOverlap(box, placedBoxes, 8)) {
          ctx.save();
          ctx.font = `italic ${size}px Georgia, serif`;
          ctx.fillStyle = "#08121a";
          ctx.globalAlpha = alpha;
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(word, x, y);
          ctx.restore();
          placedBoxes.push(box);
          placed = true;
        }
      }
    }
  });

  const scores = wordData.map(d => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore || 1;
  const margin = 18;
  let skipped = 0;

  const sorted = [...wordData].sort((a, b) => b.score - a.score);
  let rng = 0.5;
  const nextRand = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };

  sorted.forEach(({ word, score }) => {
    const norm = (score - minScore) / scoreRange;
    const size = Math.round(9 + norm * 23);
    const color = fieldColor(norm);
    const alpha = 0.55 + norm * 0.45;
    let placed = false;

    for (let attempt = 0; attempt < 400; attempt++) {
      const angle = nextRand() * 2 * Math.PI;
      const minR = pearlRadius + 54;
      const maxR = Math.min(cx, cy) - margin - size;
      if (maxR < minR) break;
      const radius = minR + nextRand() * (maxR - minR);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (x - size * 2 < margin || x + size * 2 > W - margin) continue;
      if (y - size < margin || y > H - margin) continue;
      if (Math.hypot(x - cx, y - cy) < pearlRadius + 52) continue;

      const box = getBBox(ctx, word, x, y, size);
      if (anyOverlap(box, placedBoxes, 7)) continue;

      const rotation = (nextRand() - 0.5) * 0.30;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.font = `${size}px Georgia, serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(word, 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;
      placedBoxes.push(box);
      placed = true;
      break;
    }
    if (!placed) skipped++;
  });

  ctx.globalAlpha = 1;
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#ccc";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(
    `Topic: ${topic}  ·  ${wordData.length} AI field words sized by associative frequency  ·  Students' associations within`,
    20, H - 16
  );

  return skipped;
}

export default function App() {
  const [topic, setTopic] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [wordCount, setWordCount] = useState(100);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [skipped, setSkipped] = useState(0);
  const [generated, setGenerated] = useState(false);
  const canvasRef = useRef(null);

  const generate = async () => {
    const t = topic.trim();
    const studentWords = studentInput.split(/,|\n/).map(s => s.trim()).filter(Boolean);
    if (!t) { setStatusType("error"); setStatus("Please enter a topic."); return; }
    if (studentWords.length === 0) { setStatusType("error"); setStatus("Please enter at least one student association."); return; }

    setStatus("Generating field words and frequency scores…");
    setStatusType("");
    setGenerated(false);

    const prompt = `You are a linguistic and cultural knowledge expert. For the topic "${t}", generate approximately ${wordCount} words and short phrases that are commonly associated with this topic.

For each word or phrase, assign a frequency score from 1 (rare or peripheral association) to 100 (extremely common or central association).

Return ONLY a JSON array of objects with "word" and "score" fields. Example:
[{"word": "example", "score": 87}, {"word": "another", "score": 34}]

No explanation, no markdown, just the JSON array.`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `API error ${response.status}`);
      const text = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const wordData = JSON.parse(clean);

      if (!Array.isArray(wordData) || wordData.length === 0) throw new Error("Empty response");

      setStatus("Rendering…");
      setTimeout(() => {
        const canvas = canvasRef.current;
        const sk = renderVisualization(canvas, t, wordData, studentWords);
        setSkipped(sk);
        setStatus("");
        setGenerated(true);
      }, 50);

    } catch (e) {
      setStatusType("error");
      setStatus(`Error: ${e.message}`);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `visualization-${topic.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{
      fontFamily: "'Josefin Sans', 'Trebuchet MS', sans-serif",
      background: "#f0ede8",
      minHeight: "100vh",
      padding: "30px 24px 50px",
      maxWidth: 960,
      margin: "0 auto",
      color: "#2a2318"
    }}>
      <h1 style={{
        fontFamily: "Georgia, serif",
        fontSize: "2rem",
        fontWeight: 400,
        marginBottom: 4,
        color: "#1a1208"
      }}>Seeing the Difference</h1>
      <p style={{
        fontSize: 12,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#999",
        marginBottom: 28,
        marginTop: 0
      }}>A Human vs. A.I. Writing Visualization Tool</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888" }}>Topic</label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="e.g. Imagery in Tolstoy's Anna Karenina"
            style={{
              fontFamily: "Georgia, serif", fontSize: 15,
              background: "#fff", border: "1px solid #ddd", borderRadius: 3,
              padding: "10px 12px", color: "#1a1208", outline: "none"
            }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888" }}>
            Number of AI-generated field words
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <input
              type="range" min="20" max="200" step="5" value={wordCount}
              onChange={e => setWordCount(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: "#2a6090" }}
            />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 17, minWidth: 36, textAlign: "right" }}>{wordCount}</span>
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888" }}>
            Students' Associations (first word = seed, separate by commas or new lines)
          </label>
          <textarea
            value={studentInput}
            onChange={e => setStudentInput(e.target.value)}
            rows={3}
            placeholder="Enter words separated by commas or new lines"
            style={{
              fontFamily: "Georgia, serif", fontSize: 15,
              background: "#fff", border: "1px solid #ddd", borderRadius: 3,
              padding: "10px 12px", color: "#1a1208", outline: "none", resize: "vertical"
            }}
          />
        </div>
      </div>

      <button
        onClick={generate}
        style={{
          fontFamily: "inherit", fontSize: 12, letterSpacing: "0.18em",
          textTransform: "uppercase", background: "#2a4a6a", color: "#fff",
          border: "none", borderRadius: 3, padding: "13px 32px",
          cursor: "pointer", width: "100%", marginBottom: 16,
          transition: "opacity 0.2s"
        }}
        onMouseEnter={e => e.target.style.opacity = "0.85"}
        onMouseLeave={e => e.target.style.opacity = "1"}
      >
        Generate Visualization
      </button>

      {status && (
        <p style={{ fontSize: 12, letterSpacing: "0.1em", color: statusType === "error" ? "#c03030" : "#999", textTransform: "uppercase", marginBottom: 10 }}>
          {status}
        </p>
      )}

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: "block", border: "1px solid #ddd", background: "white", width: "100%", height: "auto", borderRadius: 6 }}
      />

      {generated && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {skipped > 0 && (
            <p style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.06em", margin: 0 }}>
              {skipped} word{skipped > 1 ? "s" : ""} skipped (couldn't place without overlapping).
            </p>
          )}
          <button
            onClick={download}
            style={{
              fontFamily: "inherit", fontSize: 11, letterSpacing: "0.14em",
              textTransform: "uppercase", background: "transparent",
              color: "#2a4a6a", border: "1px solid #2a4a6a", borderRadius: 3,
              padding: "8px 20px", cursor: "pointer", marginLeft: "auto"
            }}
          >
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}