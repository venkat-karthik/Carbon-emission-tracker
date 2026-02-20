"use client";

import { useState } from "react";
import {
  FileText, Download, Share2, CheckSquare, Square,
  BarChart3, Leaf, TrendingUp, Target, Clock,
  ChevronRight, Eye,
} from "lucide-react";
import GreenGauge from "@/components/dashboard/GreenGauge";
import { cn } from "@/lib/utils";

const zones = ["Main Campus", "Hostel Zone", "Block A", "Block B", "CSE Dept"];
const dateRanges = ["Last 7 days", "Last 30 days", "Last Quarter", "Custom"];

export default function ReportsPage() {
  const [selectedZone, setSelectedZone] = useState("Main Campus");
  const [selectedRange, setSelectedRange] = useState("Last 7 days");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecs, setIncludeRecs] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1500);
  };

  const handleDownload = (format: "pdf" | "csv") => {
    setDownloading(format);
    setTimeout(() => {
      const blob = new Blob([`Report data in ${format.toUpperCase()} format`], { 
        type: format === "pdf" ? "application/pdf" : "text/csv" 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${selectedZone.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(null);
    }, 800);
  };

  const handleShare = () => {
    alert("Share link copied to clipboard!");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Reports
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Build, preview, and export sustainability reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Builder */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 space-y-5 h-fit">
          <h2 className="font-semibold text-foreground">Report Builder</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => { setSelectedZone(e.target.value); setGenerated(false); }}
              className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {zones.map((z) => <option key={z}>{z}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Date Range</label>
            <select
              value={selectedRange}
              onChange={(e) => { setSelectedRange(e.target.value); setGenerated(false); }}
              className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {dateRanges.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Include Sections</label>
            {[
              { label: "Charts & Visualizations", key: "charts", val: includeCharts, set: setIncludeCharts },
              { label: "Recommendations", key: "recs", val: includeRecs, set: setIncludeRecs },
              { label: "Raw Data Appendix (Admin)", key: "raw", val: includeRawData, set: setIncludeRawData },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => { opt.set(!opt.val); setGenerated(false); }}
                className="flex items-center gap-2.5 w-full py-2 text-sm hover:text-foreground transition-colors group"
              >
                {opt.val ? (
                  <CheckSquare className="w-4.5 h-4.5 text-primary" />
                ) : (
                  <Square className="w-4.5 h-4.5 text-muted-foreground" />
                )}
                <span className={cn(opt.val ? "text-foreground" : "text-muted-foreground")}>{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className={cn(
              "w-full py-3 text-sm font-semibold rounded-xl transition-all",
              generating
                ? "bg-primary/60 text-primary-foreground cursor-wait"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Report"
            )}
          </button>

          {generated && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleDownload("pdf")}
                disabled={downloading === "pdf"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl border border-border hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> {downloading === "pdf" ? "Downloading..." : "PDF"}
              </button>
              <button 
                onClick={() => handleDownload("csv")}
                disabled={downloading === "csv"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl border border-border hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> {downloading === "csv" ? "Downloading..." : "CSV"}
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl border border-border hover:bg-secondary transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          {!generated ? (
            <div className="bg-card rounded-2xl border border-dashed border-border h-full min-h-[400px] flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Eye className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Report Preview</div>
                <p className="text-sm text-muted-foreground mt-1">Configure and generate a report to see the preview here</p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Report Header */}
              <div className="bg-primary/10 px-8 py-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-5 h-5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">GreenIndex Report</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{selectedZone}</h2>
                    <p className="text-sm text-muted-foreground">{selectedRange} · Generated Feb 19, 2026</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-primary">73</div>
                    <div className="text-xs text-muted-foreground">Green Index</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "vs Last Period", value: "+3.4 pts", icon: TrendingUp, color: "text-green-500" },
                    { label: "Monthly Savings", value: "₹42,800", icon: Target, color: "text-primary" },
                    { label: "CO₂ Reduced", value: "2.4 T", icon: Leaf, color: "text-green-600" },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="bg-muted rounded-xl p-3 text-center">
                        <Icon className={cn("w-5 h-5 mx-auto mb-1", s.color)} />
                        <div className={cn("font-bold text-sm", s.color)}>{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Category scores */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Category Scores</h3>
                  {[
                    { cat: "Energy", score: 68, color: "bg-yellow-500" },
                    { cat: "Water", score: 74, color: "bg-blue-500" },
                    { cat: "Waste", score: 61, color: "bg-green-500" },
                    { cat: "Transport", score: 79, color: "bg-orange-500" },
                  ].map((c) => (
                    <div key={c.cat} className="flex items-center gap-3 py-1.5">
                      <span className="text-xs text-muted-foreground w-16">{c.cat}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div className={cn("h-full rounded-full", c.color)} style={{ width: `${c.score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-foreground w-8 text-right">{c.score}</span>
                    </div>
                  ))}
                </div>

                {/* Top Issues */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Top Issues Identified</h3>
                  {[
                    "Block B peak usage +18% → −6 pts",
                    "Waste segregation missing in Hostel 2 → −4 pts",
                    "Water leak suspected in Lab Block → −3 pts",
                  ].map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground py-1">
                      <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      {issue}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Actions Tracker</h3>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-green-500/10 rounded-xl p-2">
                      <div className="font-bold text-green-600">3</div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-xl p-2">
                      <div className="font-bold text-yellow-600">2</div>
                      <div className="text-muted-foreground">In Progress</div>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-2">
                      <div className="font-bold text-red-600">4</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>

                {includeRecs && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Recommendations</h3>
                    {[
                      "Implement auto-off policy for ACs in Block B after 10 PM",
                      "Deploy color-coded waste bins in Hostel 2",
                      "Install flow sensors to detect pipe leakage in Lab Block",
                      "Convert remaining 60 lights to LED in Phase 2",
                    ].map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground py-1">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">{i + 1}</div>
                        {rec}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
                  GreenIndex Campus Sustainability OS · v1.0 · Confidential
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
