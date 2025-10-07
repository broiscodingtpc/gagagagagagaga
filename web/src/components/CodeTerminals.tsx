import { useEffect, useState } from "react";

interface CodeBox {
  id: number;
  title: string;
  lines: Array<{ text: string; type: string }>;
  top: string;
  left: string;
}

const MOCK_PROCESSES = [
  {
    title: "⚡ NEURONAL NETWORK GRID",
    lines: [
      { text: "[INIT] Loading neural pathways...", type: "info" },
      { text: "[OK] Mesh connections: 247 active", type: "success" },
      { text: "[OK] Synaptic resonance: 98.7%", type: "success" },
      { text: "[SCAN] Integrity check: PASSED", type: "success" },
      { text: "[SYNC] Quantum entanglement stable", type: "info" },
    ],
  },
  {
    title: "🛡️ SAFETY PROTOCOL",
    lines: [
      { text: "[CHECK] Anti-jailbreak: ACTIVE", type: "success" },
      { text: "[CHECK] Guardrails: ENABLED", type: "success" },
      { text: "[WARN] Anomaly detection: 2 flags", type: "warning" },
      { text: "[OK] Containment protocols ready", type: "success" },
      { text: "[MONITOR] Threat level: MINIMAL", type: "info" },
    ],
  },
  {
    title: "🔮 ORACLE SUBSYSTEM",
    lines: [
      { text: "[ONLINE] Groq API connection stable", type: "success" },
      { text: "[MODEL] llama-3.3-70b-versatile", type: "info" },
      { text: "[OK] Token buffer: 650 capacity", type: "success" },
      { text: "[OK] Temperature: 0.9 (optimal)", type: "success" },
      { text: "[READY] Awaiting node queries...", type: "info" },
    ],
  },
  {
    title: "📡 MESH STATISTICS",
    lines: [
      { text: "[NODES] Active connections: 1,247", type: "info" },
      { text: "[ENERGY] Core flux: 72%", type: "success" },
      { text: "[LATENCY] Response time: 47ms", type: "success" },
      { text: "[BANDWIDTH] Neural throughput: HIGH", type: "success" },
      { text: "[STATUS] Distributed cognition: OPTIMAL", type: "info" },
    ],
  },
];

export default function CodeTerminals() {
  const [boxes, setBoxes] = useState<CodeBox[]>([]);

  useEffect(() => {
    // Generate random positions for code boxes
    const positions = [
      { top: "8%", left: "5%" },
      { top: "12%", left: "82%" },
      { top: "60%", left: "3%" },
      { top: "65%", left: "80%" },
    ];

    const initialBoxes: CodeBox[] = MOCK_PROCESSES.map((proc, i) => ({
      id: i,
      title: proc.title,
      lines: proc.lines,
      top: positions[i]?.top || "10%",
      left: positions[i]?.left || "10%",
    }));

    setBoxes(initialBoxes);

    // Animate lines cycling
    const interval = setInterval(() => {
      setBoxes((prev) =>
        prev.map((box) => {
          const process = MOCK_PROCESSES[box.id];
          if (!process) return box;

          // Rotate lines to create scrolling effect
          const newLines = [...box.lines];
          const firstLine = newLines.shift();
          if (firstLine) newLines.push(firstLine);

          return { ...box, lines: newLines };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="code-terminals">
      {boxes.map((box) => (
        <div
          key={box.id}
          className="code-box"
          style={{ top: box.top, left: box.left }}
        >
          <div className="code-box-title">{box.title}</div>
          {box.lines.map((line, i) => (
            <div key={i} className={`code-line ${line.type}`}>
              {line.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

