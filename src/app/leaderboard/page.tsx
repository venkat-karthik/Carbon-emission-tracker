"use client";

import { useState, useEffect } from "react";
import {
  Trophy, TrendingUp, TrendingDown, Star, Zap, Droplets,
  Recycle, Bus, ChevronRight, Medal, Award, Shield,
} from "lucide-react";
import { leaderboardData } from "@/lib/mock-data";
import { csvProcessor } from "@/lib/csv-processor";
import { cn } from "@/lib/utils";

const tabs = ["Departments", "Hostels", "Blocks"];

const badgeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  "Most Improved": { icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-500/10" },
  "Power Saver": { icon: Zap, color: "text-yellow-600", bg: "bg-yellow-500/10" },
  "Waste Champion": { icon: Recycle, color: "text-green-600", bg: "bg-green-500/10" },
  "Water Guardian": { icon: Droplets, color: "text-blue-500", bg: "bg-blue-400/10" },
};

const rankColors = ["text-yellow-500", "text-slate-400", "text-orange-600"];
const rankBgs = ["bg-yellow-500/10", "bg-slate-400/10", "bg-orange-600/10"];

interface LeaderRow {
  rank: number;
  name: string;
  score: number;
  change: number;
  badge: string | null;
  trend: string;
  categoryScores?: {
    energy: number;
    water: number;
    waste: number;
    transport: number;
  };
}

function LeaderCard({ row, expanded, onClick }: { row: LeaderRow; expanded: boolean; onClick: () => void }) {
  const isTop3 = row.rank <= 3;
  
  // Use actual category scores if available, otherwise calculate from overall score
  const categoryScores = row.categoryScores || {
    energy: Math.round(row.score * 0.92),
    water: Math.round(row.score * 1.05),
    waste: Math.round(row.score * 0.85),
    transport: Math.round(row.score * 1.08),
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl border transition-all cursor-pointer",
        expanded ? "border-primary/40 shadow-lg" : "border-border hover:border-primary/20",
        isTop3 && "relative overflow-hidden"
      )}
      onClick={onClick}
    >
      {isTop3 && (
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", row.rank === 1 ? "bg-yellow-500" : row.rank === 2 ? "bg-slate-400" : "bg-orange-600")} />
      )}
      <div className="flex items-center gap-4 p-4 pl-5">
        {/* Rank */}
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0",
          isTop3 ? `${rankBgs[row.rank - 1]} ${rankColors[row.rank - 1]}` : "bg-muted text-muted-foreground"
        )}>
          {row.rank <= 3 ? <Medal className="w-5 h-5" /> : row.rank}
        </div>

        {/* Name + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm">{row.name}</span>
            {row.badge && (() => {
              const cfg = badgeConfig[row.badge];
              const Icon = cfg.icon;
              return (
                <span className={cn("flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full", cfg.bg, cfg.color)}>
                  <Icon className="w-3 h-3" />
                  {row.badge}
                </span>
              );
            })()}
          </div>
          <div className={cn("text-xs flex items-center gap-0.5 mt-0.5", row.change >= 0 ? "text-green-500" : "text-red-500")}>
            {row.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {row.change >= 0 ? "+" : ""}{row.change} this period
          </div>
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0">
          <div className={cn("text-2xl font-black",
            row.score >= 80 ? "text-green-500" : row.score >= 60 ? "text-yellow-500" : "text-red-500"
          )}>
            {row.score}
          </div>
          <div className="text-[10px] text-muted-foreground">/ 100</div>
        </div>
        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
      </div>

      {/* Expanded mini profile */}
      {expanded && (
        <div className="px-5 pb-4 pt-0 border-t border-border">
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Energy", score: categoryScores.energy, color: "text-yellow-500" },
              { label: "Water", score: categoryScores.water, color: "text-blue-500" },
              { label: "Waste", score: categoryScores.waste, color: "text-green-500" },
              { label: "Transport", score: categoryScores.transport, color: "text-orange-500" },
            ].map((cat) => (
              <div key={cat.label} className="bg-muted rounded-lg p-2.5 text-center">
                <div className={cn("text-lg font-bold", cat.color)}>{Math.min(100, cat.score)}</div>
                <div className="text-xs text-muted-foreground">{cat.label}</div>
                <div className="mt-1.5 h-1 bg-border rounded-full">
                  <div
                    className={cn("h-full rounded-full", cat.color === "text-yellow-500" ? "bg-yellow-500" : cat.color === "text-blue-500" ? "bg-blue-500" : cat.color === "text-green-500" ? "bg-green-500" : "bg-orange-500")}
                    style={{ width: `${Math.min(100, cat.score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("Departments");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [leaderboardState, setLeaderboardState] = useState(leaderboardData);
  const [hasUploadedData, setHasUploadedData] = useState(false);

  // Subscribe to CSV data updates
  useEffect(() => {
    const updateLeaderboard = () => {
      const calculatedData = csvProcessor.calculateLeaderboard();
      
      // Check if we have any calculated data
      const hasData = calculatedData.departments.length > 0 || 
                      calculatedData.hostels.length > 0 || 
                      calculatedData.blocks.length > 0;

      if (hasData) {
        setHasUploadedData(true);
        setLeaderboardState(calculatedData);
      } else {
        setHasUploadedData(false);
        setLeaderboardState(leaderboardData);
      }
    };

    // Initial update
    updateLeaderboard();

    // Subscribe to changes
    const unsubscribe = csvProcessor.subscribe(updateLeaderboard);

    return () => unsubscribe();
  }, []);

  const data =
    activeTab === "Departments"
      ? leaderboardState.departments
      : activeTab === "Hostels"
      ? leaderboardState.hostels
      : leaderboardState.blocks;

  const badges = [
    { icon: Zap, label: "Power Saver", desc: "Largest energy reduction", holder: "Library & Admin", color: "text-yellow-600 bg-yellow-500/10" },
    { icon: TrendingUp, label: "Most Improved", desc: "Biggest score jump", holder: "Computer Science", color: "text-blue-600 bg-blue-500/10" },
    { icon: Recycle, label: "Waste Champion", desc: "Best segregation rate", holder: "Boys Hostel A", color: "text-green-600 bg-green-500/10" },
    { icon: Droplets, label: "Water Guardian", desc: "Lowest water intensity", holder: "Civil Dept", color: "text-blue-500 bg-blue-400/10" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Sustainability Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Rankings drive behavior. See who leads — and who needs to step up.</p>
        </div>
        {hasUploadedData && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-600">Live Data Active</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Achievement Badges</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <button
                key={b.label}
                onClick={() => {
                  // Filter to show only entities with this badge
                  const holder = b.holder;
                  const matchingEntity = data.find(row => row.name === holder);
                  if (matchingEntity) {
                    setExpandedId(matchingEntity.rank);
                  }
                }}
                className={cn("rounded-xl p-4 border border-border bg-card hover:border-primary/40 transition-all cursor-pointer text-left")}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", b.color.split(" ")[1])}>
                  <Icon className={cn("w-5 h-5", b.color.split(" ")[0])} />
                </div>
                <div className="font-semibold text-sm text-foreground">{b.label}</div>
                <div className="text-xs text-muted-foreground">{b.desc}</div>
                <div className={cn("text-xs font-medium mt-1.5", b.color.split(" ")[0])}>→ {b.holder}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl w-fit mb-5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setExpandedId(null); }}
              className={cn(
                "px-4 py-1.5 text-sm rounded-lg font-medium transition-all",
                activeTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {data.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">No Data Available</h3>
              <p className="text-sm text-muted-foreground">
                Upload CSV data with zones matching this category to see rankings.
              </p>
            </div>
          ) : (
            data.map((row) => (
              <LeaderCard
                key={row.rank}
                row={row}
                expanded={expandedId === row.rank}
                onClick={() => setExpandedId(expandedId === row.rank ? null : row.rank)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
