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

  const padding = size * 0.15; // Add padding to prevent clipping
  const viewBoxSize = size + padding * 2;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2 + padding * 0.3; // Move center down slightly
  const r = size * 0.35;
  const strokeWidth = size * 0.15;

  // Arc from 135° to 405° (270° span) - full semicircle plus sides
  const startAngle = 135;
  const endAngle = 405;
  const totalSpan = endAngle - startAngle; // 270 degrees

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

  // Very vibrant, saturated colors
  const color =
    animated >= 80 ? "#22c55e" : animated >= 60 ? "#fb923c" : "#ef4444";

  // Calculate the fill based on score percentage
  const fillFraction = animated / 100;
  const fillAngle = startAngle + (fillFraction * totalSpan);
  const dashOffset = arcLength * (1 - fillFraction);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
        className="relative"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id={`shadow-${score}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={color} floodOpacity="0.6"/>
          </filter>
        </defs>

        {/* Background track - solid and visible */}
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke="#d1d5db"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored fill - shows exact percentage */}
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={dashOffset}
          style={{ 
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1), stroke 0.5s",
          }}
          filter={`url(#shadow-${score})`}
        />

        {/* Score text */}
        <text
          x={cx}
          y={cy - size * 0.05}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.32}
          fontWeight="900"
          fill={color}
          style={{ 
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {Math.round(animated)}
        </text>
        
        {/* /100 text */}
        <text
          x={cx}
          y={cy + size * 0.09}
          textAnchor="middle"
          fontSize={size * 0.09}
          fill="#6b7280"
          fontWeight="600"
        >
          / 100
        </text>
        
        {/* Green Index label */}
        <text
          x={cx}
          y={cy + size * 0.19}
          textAnchor="middle"
          fontSize={size * 0.07}
          fill="#9ca3af"
          fontWeight="500"
        >
          Green Index
        </text>

        {/* Min label (0) */}
        <text
          x={cx + (r + 22) * Math.cos(toRad(startAngle))}
          y={cy + (r + 22) * Math.sin(toRad(startAngle)) + 5}
          textAnchor="end"
          fontSize={size * 0.065}
          fill="#9ca3af"
          fontWeight="600"
        >
          0
        </text>
        
        {/* Max label (100) */}
        <text
          x={cx + (r + 22) * Math.cos(toRad(endAngle))}
          y={cy + (r + 22) * Math.sin(toRad(endAngle)) + 5}
          textAnchor="start"
          fontSize={size * 0.065}
          fill="#9ca3af"
          fontWeight="600"
        >
          100
        </text>
      </svg>
    </div>
  );
}
