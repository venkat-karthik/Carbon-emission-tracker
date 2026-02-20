"use client";

import { useEffect, useState } from "react";

interface GaugeProps {
  score: number;
  size?: number;
}

export default function GreenGauge({ score, size = 220 }: GaugeProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeWidth = size * 0.08;

  // Arc from 210° to 330° (240° span)
  const startAngle = 210;
  const endAngle = 330;
  const totalSpan = 360 - startAngle + endAngle; // 240 degrees

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number) => {
    const s = toRad(start);
    const e = toRad(end);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const circumference = 2 * Math.PI * r;
  const arcLength = (totalSpan / 360) * circumference;

  // Score color
  const color =
    animated >= 80 ? "#22c55e" : animated >= 60 ? "#eab308" : "#ef4444";
  const glowColor =
    animated >= 80 ? "rgba(34,197,94,0.4)" : animated >= 60 ? "rgba(234,179,8,0.4)" : "rgba(239,68,68,0.4)";

  const fillFraction = animated / 100;
  const fillLength = fillFraction * arcLength;
  const dashOffset = arcLength - fillLength;

  // Tick marks
  const ticks = [0, 20, 40, 60, 80, 100];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* Track */}
      <path
        d={arcPath(startAngle, startAngle + totalSpan)}
        fill="none"
        stroke="oklch(0.88 0.04 148)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Colored fill */}
      <path
        d={arcPath(startAngle, startAngle + totalSpan)}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength}`}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1), stroke 0.5s" }}
        filter="url(#glow)"
      />

      {/* Tick marks */}
      {ticks.map((tick) => {
        const angle = toRad(startAngle + (tick / 100) * totalSpan);
        const inner = r - strokeWidth / 2 - 6;
        const outer = r - strokeWidth / 2 - 2;
        return (
          <line
            key={tick}
            x1={cx + inner * Math.cos(angle)}
            y1={cy + inner * Math.sin(angle)}
            x2={cx + outer * Math.cos(angle)}
            y2={cy + outer * Math.sin(angle)}
            stroke="oklch(0.6 0.06 148)"
            strokeWidth="1.5"
          />
        );
      })}

      {/* Score text */}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fontSize={size * 0.22}
        fontWeight="800"
        fill={color}
        style={{ transition: "fill 0.5s", fontFamily: "var(--font-geist-sans)" }}
      >
        {Math.round(animated)}
      </text>
      <text
        x={cx}
        y={cy + size * 0.1}
        textAnchor="middle"
        fontSize={size * 0.075}
        fill="oklch(0.52 0.04 148)"
        fontWeight="500"
      >
        / 100
      </text>
      <text
        x={cx}
        y={cy + size * 0.19}
        textAnchor="middle"
        fontSize={size * 0.06}
        fill="oklch(0.52 0.04 148)"
      >
        Green Index
      </text>

      {/* Min/Max labels */}
      <text
        x={cx + (r + 14) * Math.cos(toRad(startAngle))}
        y={cy + (r + 14) * Math.sin(toRad(startAngle))}
        textAnchor="middle"
        fontSize={size * 0.055}
        fill="oklch(0.62 0.05 148)"
      >
        0
      </text>
      <text
        x={cx + (r + 18) * Math.cos(toRad(startAngle + totalSpan))}
        y={cy + (r + 18) * Math.sin(toRad(startAngle + totalSpan))}
        textAnchor="middle"
        fontSize={size * 0.055}
        fill="oklch(0.62 0.05 148)"
      >
        100
      </text>
    </svg>
  );
}
