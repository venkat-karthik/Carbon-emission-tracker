"use client";

import { useState } from "react";
import {
  Settings, Save, RotateCcw, Info, Sliders,
  BarChart3, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabList = ["Index Weights", "Baseline Setup", "Rules Engine"];

interface WeightState {
  energy: number;
  water: number;
  waste: number;
  transport: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Index Weights");
  const [weights, setWeights] = useState<WeightState>({ energy: 40, water: 25, waste: 20, transport: 15 });
  const [saved, setSaved] = useState(false);
  const [baselineMethod, setBaselineMethod] = useState("Historical average");
  const [baselineSaved, setBaselineSaved] = useState(false);
  const [rulesSaved, setRulesSaved] = useState(false);
  const [rules, setRules] = useState({
    spikeDetection: true,
    afterHours: true,
    leakageSuspicion: true,
    wasteCompliance: true,
    spikeThreshold: 2.5,
    afterHoursThreshold: 0.8,
    wasteComplianceMin: 25,
  });

  const total = weights.energy + weights.water + weights.waste + weights.transport;

  const setWeight = (key: keyof WeightState, val: number) => {
    setSaved(false);
    // Auto-balance remaining weights proportionally
    const remaining = 100 - val;
    const otherKeys = (Object.keys(weights) as (keyof WeightState)[]).filter((k) => k !== key);
    const otherTotal = otherKeys.reduce((s, k) => s + weights[k], 0);
    const newWeights = { ...weights, [key]: val };
    if (otherTotal > 0) {
      otherKeys.forEach((k) => {
        newWeights[k] = Math.round((weights[k] / otherTotal) * remaining);
      });
      // Fix rounding
      const diff = 100 - Object.values(newWeights).reduce((a, b) => a + b, 0);
      newWeights[otherKeys[0]] += diff;
    }
    setWeights(newWeights);
  };

  const catColors: Record<keyof WeightState, string> = {
    energy: "bg-yellow-500",
    water: "bg-blue-500",
    waste: "bg-green-500",
    transport: "bg-orange-500",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Admin Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Configure index weights, baselines, and alert rules</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl w-fit">
        {tabList.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "px-4 py-2 text-sm rounded-lg font-medium transition-all",
              activeTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Index Weights */}
      {activeTab === "Index Weights" && (
        <div className="max-w-xl space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Category Weights</h2>
              <div className={cn("text-xs font-semibold px-2 py-1 rounded-full", total === 100 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                Total: {total}% {total !== 100 && "(auto-balanced)"}
              </div>
            </div>

            {/* Weight distribution visual */}
            <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
              {(Object.entries(weights) as [keyof WeightState, number][]).map(([k, v]) => (
                <div key={k} className={cn("h-full", catColors[k])} style={{ width: `${v}%`, transition: "width 0.3s" }} />
              ))}
            </div>

            {(Object.entries(weights) as [keyof WeightState, number][]).map(([key, val]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground capitalize">{key}</label>
                  <span className={cn("text-sm font-bold", catColors[key].replace("bg-", "text-"))}>{val}%</span>
                </div>
                <input
                  type="range"
                  min={5} max={70} step={5}
                  value={val}
                  onChange={(e) => setWeight(key, Number(e.target.value))}
                  className={cn("w-full h-2 rounded-full appearance-none cursor-pointer accent-primary")}
                />
              </div>
            ))}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-600 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Weights are auto-balanced to always total 100%. Different campuses may prioritize differently (e.g., a water-scarce region may give water 40%).
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setWeights({ energy: 40, water: 25, waste: 20, transport: 15 }); setSaved(false); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                onClick={() => setSaved(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saved ? "Saved!" : "Save Weights"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Baseline Setup */}
      {activeTab === "Baseline Setup" && (
        <div className="max-w-xl space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground">Baseline Configuration</h2>
            <p className="text-sm text-muted-foreground">Set how "normal" is defined for each zone. The Green Index penalizes usage above baseline.</p>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Baseline Calculation Method</label>
              <div className="space-y-2">
                {["Historical average", "Benchmark per sq.ft", "Manual baseline"].map((m) => (
                  <label key={m} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:border-primary/30 transition-all">
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      baselineMethod === m ? "border-primary" : "border-border"
                    )}>
                      {baselineMethod === m && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div
                      className="flex-1"
                      onClick={() => setBaselineMethod(m)}
                    >
                      <div className="text-sm font-medium text-foreground">{m}</div>
                      <div className="text-xs text-muted-foreground">
                        {m === "Historical average" && "Uses last 3-month average as baseline"}
                        {m === "Benchmark per sq.ft" && "Industry standard per unit area"}
                        {m === "Manual baseline" && "Set fixed thresholds per zone"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Zone Baselines (Energy kWh/day)</h3>
              {[
                { zone: "Main Campus", val: 280, key: "mainCampus" },
                { zone: "Hostel Zone", val: 120, key: "hostelZone" },
                { zone: "Block A", val: 85, key: "blockA" },
                { zone: "Block B", val: 95, key: "blockB" },
                { zone: "CSE Dept", val: 45, key: "cseDept" },
              ].map((z) => (
                <div key={z.zone} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28">{z.zone}</span>
                  <input
                    type="number"
                    defaultValue={z.val}
                    onChange={() => setBaselineSaved(false)}
                    className="flex-1 px-3 py-2 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <span className="text-xs text-muted-foreground">kWh/day</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setBaselineSaved(true);
                setTimeout(() => setBaselineSaved(false), 2000);
              }}
              className="w-full py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {baselineSaved ? "✓ Saved!" : "Save Baselines"}
            </button>
          </div>
        </div>
      )}

      {/* Rules Engine */}
      {activeTab === "Rules Engine" && (
        <div className="max-w-2xl space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Alert & Insight Rules</h2>
            <p className="text-sm text-muted-foreground">Configure which rules trigger alerts and insights. Threshold values control sensitivity.</p>

            {/* Rules toggles */}
            {[
              {
                key: "spikeDetection" as const,
                label: "Spike Detection",
                desc: "Alert when consumption exceeds threshold × baseline",
                threshold: "spikeThreshold" as const,
                thresholdLabel: "Spike threshold (×)",
                min: 1.5, max: 5, step: 0.5,
              },
              {
                key: "afterHours" as const,
                label: "After-Hours Usage Rule",
                desc: "Alert when after-hours load exceeds threshold kWh",
                threshold: "afterHoursThreshold" as const,
                thresholdLabel: "After-hours limit (kWh)",
                min: 0.2, max: 3, step: 0.1,
              },
              {
                key: "wasteCompliance" as const,
                label: "Waste Compliance Rule",
                desc: "Alert when segregation rate drops below threshold",
                threshold: "wasteComplianceMin" as const,
                thresholdLabel: "Min compliance (%)",
                min: 10, max: 70, step: 5,
              },
            ].map((rule) => (
              <div
                key={rule.key}
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  rules[rule.key] ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm text-foreground">{rule.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{rule.desc}</div>
                  </div>
                  <button
                    onClick={() => setRules((p) => ({ ...p, [rule.key]: !p[rule.key] }))}
                    className={cn(
                      "w-11 h-6 rounded-full transition-all relative flex-shrink-0 ml-4",
                      rules[rule.key] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                      rules[rule.key] ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
                {rules[rule.key] && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{rule.thresholdLabel}</span>
                    <input
                      type="range"
                      min={rule.min} max={rule.max} step={rule.step}
                      value={rules[rule.threshold]}
                      onChange={(e) => setRules((p) => ({ ...p, [rule.threshold]: Number(e.target.value) }))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-sm font-bold text-primary w-8 text-right">{rules[rule.threshold]}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Leakage rule */}
            <div className={cn("rounded-xl border p-4", rules.leakageSuspicion ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30")}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-sm text-foreground">Leakage Suspicion Rule</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Alert when overnight water flow is 1.5× daytime average</div>
                </div>
                <button
                  onClick={() => setRules((p) => ({ ...p, leakageSuspicion: !p.leakageSuspicion }))}
                  className={cn("w-11 h-6 rounded-full transition-all relative flex-shrink-0 ml-4", rules.leakageSuspicion ? "bg-primary" : "bg-muted")}
                >
                  <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all", rules.leakageSuspicion ? "left-6" : "left-1")} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                setRulesSaved(true);
                setTimeout(() => setRulesSaved(false), 2000);
              }}
              className="w-full py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {rulesSaved ? "✓ Saved!" : "Save Rules"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
