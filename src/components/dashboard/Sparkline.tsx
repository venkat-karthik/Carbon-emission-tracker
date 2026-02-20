"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, color = "#22c55e", width = 80, height = 32 }: SparklineProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState({ value: 0, index: 0 });

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  // Area fill
  const first = points[0];
  const last = points[points.length - 1];
  const area = `${first} ${polyline} ${last.split(",")[0]},${height} 0,${height}`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.round((x / width) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    setTooltipData({ value: data[clampedIndex], index: clampedIndex });
    setShowTooltip(true);
  };

  return (
    <div className="relative inline-block">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-pointer"
      >
        <defs>
          <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={area}
          fill={`url(#sg-${color.replace(/[^a-z0-9]/gi, "")})`}
        />
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last dot */}
        <circle
          cx={parseFloat(last.split(",")[0])}
          cy={parseFloat(last.split(",")[1])}
          r="3"
          fill={color}
        />
      </svg>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded shadow-lg text-xs whitespace-nowrap z-10">
          <div className="font-semibold" style={{ color }}>{tooltipData.value}</div>
          <div className="text-muted-foreground text-[10px]">Day {tooltipData.index + 1}</div>
        </div>
      )}
    </div>
  );
}
