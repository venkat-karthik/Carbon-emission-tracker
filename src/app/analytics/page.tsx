"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import {
  Zap, Droplets, Recycle, Bus, TrendingUp, TrendingDown,
  Download, Plus, Filter, ChevronDown, Info, AlertCircle,
  CheckCircle, ArrowRight, X,
} from "lucide-react";
import {
  greenIndexTrend, peakHeatmapData, penaltiesCredits, analyticsInsights,
} from "@/lib/mock-data";
import { iotManager } from "@/lib/iot-sensors";
import { csvProcessor } from "@/lib/csv-processor";
import { cn } from "@/lib/utils";

const categories = ["All", "Energy", "Water", "Waste", "Transport"];
const zones = ["All Zones", "Main Campus", "Hostel Zone", "Block A", "Block B", "CSE Dept"];

const heatColors = (val: number) => {
  if (val >= 4) return "bg-red-500 text-white";
  if (val >= 3) return "bg-orange-400 text-white";
  if (val >= 2) return "bg-yellow-400 text-white";
  if (val >= 1) return "bg-green-300 text-green-900";
  return "bg-green-100 text-green-700";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
            <span className="font-medium">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeZone, setActiveZone] = useState("All Zones");
  const [showBaseline, setShowBaseline] = useState(false);
  const [createActionId, setCreateActionId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{day: string, hour: string, value: number} | null>(null);
  const [sensorData, setSensorData] = useState<any>(null);
  const [csvData, setCSVData] = useState<any[]>([]);

  // Handle category query param
  useEffect(() => {
    if (categoryParam) {
      const normalized = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1).toLowerCase();
      if (categories.includes(normalized)) {
        setActiveCategory(normalized);
      }
    }
  }, [categoryParam]);

  // Get filtered data based on active category
  const filteredData = useMemo(() => {
    if (activeCategory === "All") {
      return {
        trendData: greenIndexTrend,
        score: 73,
        change: 5.4,
      };
    }

    // Get real-time sensor data for the category
    const categoryKey = activeCategory.toLowerCase() as 'energy' | 'water' | 'waste' | 'transport';
    const aggregated = iotManager.getAggregatedData(categoryKey);
    const score = iotManager.getCategoryScore(categoryKey);

    // Generate category-specific trend data
    const trendData = greenIndexTrend.map((item, idx) => ({
      ...item,
      score: aggregated.trend[idx] || item.score,
      [categoryKey]: aggregated.trend[idx] || item[categoryKey as keyof typeof item],
    }));

    return {
      trendData,
      score,
      change: ((score - 70) / 70 * 100).toFixed(1),
      aggregated,
    };
  }, [activeCategory]);

  // Subscribe to real-time sensor updates
  useEffect(() => {
    // Start real-time updates
    iotManager.startRealTimeUpdates(5000);

    const unsubscribe = iotManager.subscribe((reading) => {
      // Update sensor data when new readings come in
      setSensorData(reading);
    });

    // Subscribe to CSV data updates
    const unsubscribeCSV = csvProcessor.subscribe((data) => {
      setCSVData(data);
    });

    // Load initial CSV data
    setCSVData(csvProcessor.getUploadedData());

    return () => {
      unsubscribe();
      unsubscribeCSV();
      iotManager.stopRealTimeUpdates();
    };
  }, []);

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      // Simulate download
      const blob = new Blob(["Chart data exported"], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${activeCategory}-${activeZone}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 800);
  };

  const penalties = penaltiesCredits.filter((p) => p.type === "penalty");
  const credits = penaltiesCredits.filter((p) => p.type === "credit");
  const allBars = [
    ...credits.map((c) => ({ ...c, value: Math.abs(c.value) })),
    ...penalties.map((p) => ({ ...p, value: -Math.abs(p.value) })),
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Deep-dive into every dimension of campus sustainability</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={downloading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? "Exporting..." : "Export Charts"}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg font-medium transition-all",
                activeCategory === c
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={activeZone}
          onChange={(e) => setActiveZone(e.target.value)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        >
          {zones.map((z) => <option key={z}>{z}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <div
            onClick={() => setShowBaseline(!showBaseline)}
            className={cn(
              "w-9 h-5 rounded-full transition-all relative",
              showBaseline ? "bg-primary" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                showBaseline ? "left-4.5" : "left-0.5"
              )}
            />
          </div>
          <span className="text-muted-foreground">vs Baseline</span>
        </label>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart A: Green Index Trend */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">
                {activeCategory === "All" ? "Green Index Trend" : `${activeCategory} Score Trend`}
              </h3>
              <p className="text-xs text-muted-foreground">Score progression over time</p>
            </div>
            <div className="flex items-center gap-1.5 text-green-500 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              +{filteredData.change} pts
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={filteredData.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 148)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="transparent" />
              <YAxis domain={[55, 85]} tick={{ fontSize: 11 }} stroke="transparent" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="oklch(0.52 0.18 148)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "oklch(0.52 0.18 148)" }}
                activeDot={{ r: 6 }}
              />
              {showBaseline && (
                <Line
                  type="monotone"
                  dataKey={() => 65}
                  stroke="oklch(0.65 0.15 30)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="baseline"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart B: Breakdown Over Time */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Category Breakdown Over Time</h3>
              <p className="text-xs text-muted-foreground">Stacked contribution by category</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={greenIndexTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 148)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="transparent" />
              <YAxis tick={{ fontSize: 11 }} stroke="transparent" />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} />
              <Area type="monotone" dataKey="energy" stackId="1" stroke="#eab308" fill="#eab30830" strokeWidth={1.5} />
              <Area type="monotone" dataKey="water" stackId="1" stroke="#3b82f6" fill="#3b82f630" strokeWidth={1.5} />
              <Area type="monotone" dataKey="waste" stackId="1" stroke="#22c55e" fill="#22c55e30" strokeWidth={1.5} />
              <Area type="monotone" dataKey="transport" stackId="1" stroke="#f97316" fill="#f9731630" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart C: Peak Usage Heatmap */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Peak Usage Heatmap</h3>
              <p className="text-xs text-muted-foreground">kWh · Hour vs Day of week</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Low</span>
              {["bg-green-100", "bg-green-300", "bg-yellow-400", "bg-orange-400", "bg-red-500"].map((c) => (
                <div key={c} className={cn("w-3 h-3 rounded-sm", c)} />
              ))}
              <span>High</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="text-[10px] w-full">
              <thead>
                <tr>
                  <th className="text-muted-foreground text-left pr-2 py-1">Hour</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <th key={d} className="text-muted-foreground px-1 py-1 text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {peakHeatmapData.map((row) => (
                  <tr key={row.hour}>
                    <td className="text-muted-foreground pr-2 py-0.5">{row.hour}</td>
                    {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map((d) => (
                      <td key={d} className="px-0.5 py-0.5">
                        <button
                          onClick={() => setSelectedHeatmapCell({ day: d, hour: row.hour, value: (row as any)[d] })}
                          className={cn(
                            "w-full h-5 rounded text-center leading-5 transition-all hover:ring-2 hover:ring-primary cursor-pointer",
                            heatColors((row as any)[d])
                          )}
                        >
                          {(row as any)[d]}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart D: Penalties vs Credits */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Penalties vs Credits</h3>
              <p className="text-xs text-muted-foreground">Score impact by source</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={allBars} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 148)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="transparent" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} stroke="transparent" />
              <Tooltip
                formatter={(val: number) => [`${val > 0 ? "+" : ""}${val} pts`, "Impact"]}
              />
              <Bar dataKey="value" radius={4}>
                {allBars.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.value > 0 ? "oklch(0.52 0.18 148)" : "oklch(0.65 0.22 30)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Panel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Rule-Based Insights</h2>
            <p className="text-xs text-muted-foreground">Cause → Evidence → Impact → Action</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsInsights.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "bg-card rounded-2xl border p-5 transition-all",
                insight.severity === "positive"
                  ? "border-green-500/30 bg-green-500/5"
                  : insight.severity === "high"
                  ? "border-red-500/30"
                  : "border-yellow-500/30"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {insight.severity === "positive" ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle
                      className={cn(
                        "w-4 h-4 flex-shrink-0 mt-0.5",
                        insight.severity === "high" ? "text-red-500" : "text-yellow-500"
                      )}
                    />
                  )}
                  <h4 className="font-semibold text-foreground text-sm">{insight.title}</h4>
                </div>
                <span
                  className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-lg",
                    insight.severity === "positive"
                      ? "bg-green-500/15 text-green-600"
                      : insight.severity === "high"
                      ? "bg-red-500/15 text-red-600"
                      : "bg-yellow-500/15 text-yellow-600"
                  )}
                >
                  {insight.impact}
                </span>
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground mb-3">
                <span className="font-medium text-foreground">Evidence: </span>
                {insight.evidence}
              </div>
              <div className="flex items-start gap-2 mb-3 text-xs">
                <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/80">{insight.action}</span>
              </div>
              {createActionId === insight.id ? (
                <div className="bg-primary/10 rounded-lg p-2.5 text-xs text-primary font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Action created and assigned to Facilities Manager
                </div>
              ) : (
                <button
                  onClick={() => setCreateActionId(insight.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Action
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Detail Modal */}
      {selectedHeatmapCell && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Usage Detail</h3>
              </div>
              <button onClick={() => setSelectedHeatmapCell(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-primary">{selectedHeatmapCell.value} kWh</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedHeatmapCell.day} at {selectedHeatmapCell.hour}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Peak Load</span>
                  <span className="text-sm font-semibold">{(selectedHeatmapCell.value * 1.2).toFixed(1)} kW</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">vs Average</span>
                  <span className={cn("text-sm font-semibold", selectedHeatmapCell.value > 3 ? "text-red-500" : "text-green-500")}>
                    {selectedHeatmapCell.value > 3 ? "+" : ""}{((selectedHeatmapCell.value - 2.5) / 2.5 * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Cost</span>
                  <span className="text-sm font-semibold">₹{(selectedHeatmapCell.value * 8.5).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">CO₂ Emissions</span>
                  <span className="text-sm font-semibold">{(selectedHeatmapCell.value * 0.82).toFixed(2)} kg</span>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs">
                <div className="font-semibold text-blue-600 mb-1">💡 Insight</div>
                <div className="text-muted-foreground">
                  {selectedHeatmapCell.value > 4 
                    ? "High usage detected. Consider load shifting to off-peak hours."
                    : selectedHeatmapCell.value > 3
                    ? "Moderate usage. Monitor for optimization opportunities."
                    : "Good usage level. Within optimal range."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
