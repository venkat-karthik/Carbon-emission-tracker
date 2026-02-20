"use client";

import { useState, useMemo } from "react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  FlaskConical, Save, GitCompare, Target, Download,
  Zap, Thermometer, Sun, Clock, Monitor, TrendingUp,
  TrendingDown, Leaf, IndianRupee, Wind, ChevronRight,
} from "lucide-react";
import GreenGauge from "@/components/dashboard/GreenGauge";
import { cn } from "@/lib/utils";

interface SimInput {
  acSetpoint: number;
  ledLights: number;
  solarShare: number;
  standbyReduced: number;
  labScheduleShift: string;
  evChargers: number;
  rainwaterHarvest: boolean;
  segregationTarget: number;
}

const defaults: SimInput = {
  acSetpoint: 22,
  ledLights: 40,
  solarShare: 20,
  standbyReduced: 60,
  labScheduleShift: "No change",
  evChargers: 6,
  rainwaterHarvest: false,
  segregationTarget: 60,
};

function computeScore(inp: SimInput): { score: number; savings: number; co2: number; breakdown: Record<string, number> } {
  let base = 73;
  let savings = 0;
  let co2 = 0;
  const breakdown: Record<string, number> = { energy: 0, water: 0, waste: 0, transport: 0 };

  // AC setpoint: every degree above 22 saves ~0.8 pts
  const acDelta = inp.acSetpoint - 22;
  breakdown.energy += acDelta * 0.8;
  savings += acDelta * 1200;
  co2 += acDelta * 0.12;

  // LED conversion
  breakdown.energy += (inp.ledLights / 100) * 4;
  savings += inp.ledLights * 320;
  co2 += inp.ledLights * 0.015;

  // Solar share
  breakdown.energy += (inp.solarShare / 60) * 6;
  savings += inp.solarShare * 800;
  co2 += inp.solarShare * 0.08;

  // Standby reduced
  breakdown.energy += (inp.standbyReduced / 200) * 3;
  savings += inp.standbyReduced * 150;
  co2 += inp.standbyReduced * 0.005;

  // Lab schedule shift
  if (inp.labScheduleShift === "Morning shift") { breakdown.energy += 2; savings += 4000; co2 += 0.2; }
  else if (inp.labScheduleShift === "Night shift") { breakdown.energy -= 1; }

  // EV chargers
  breakdown.transport += (inp.evChargers / 20) * 3;
  savings += inp.evChargers * 500;
  co2 += inp.evChargers * 0.03;

  // Rainwater harvest
  if (inp.rainwaterHarvest) { breakdown.water += 3; savings += 8000; co2 += 0.1; }

  // Segregation target
  breakdown.waste += ((inp.segregationTarget - 60) / 40) * 5;
  savings += (inp.segregationTarget - 60) * 200;

  const totalDelta = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const score = Math.min(100, Math.max(0, Math.round(base + totalDelta)));
  return { score, savings: Math.round(savings), co2: parseFloat((co2).toFixed(2)), breakdown };
}

interface ScenarioSliderProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  effect: string;
  onChange: (v: number) => void;
}

function ScenarioSlider({ label, icon: Icon, value, min, max, step, unit, effect, onChange }: ScenarioSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="w-4 h-4 text-primary" />
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{effect}</span>
          <span className="text-sm font-bold text-foreground w-14 text-right">{value} {unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const [inputs, setInputs] = useState<SimInput>(defaults);
  const [savedScenarios, setSavedScenarios] = useState<{ name: string; inputs: SimInput; result: ReturnType<typeof computeScore> }[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [applyTarget, setApplyTarget] = useState(false);
  const [exporting, setExporting] = useState(false);

  const result = useMemo(() => computeScore(inputs), [inputs]);
  const baseResult = useMemo(() => computeScore(defaults), []);
  const delta = result.score - baseResult.score;

  const set = (key: keyof SimInput) => (val: number | boolean) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const saveScenario = () => {
    if (!scenarioName) return;
    setSavedScenarios((prev) => [
      ...prev,
      { name: scenarioName, inputs: { ...inputs }, result: { ...result } },
    ]);
    setShowSaveInput(false);
    setScenarioName("");
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      const blob = new Blob(["Simulator Report PDF"], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `simulator-report-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-primary" />
            What-If Simulator
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Model sustainability changes and preview their impact in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputs(defaults)}
            className="px-3 py-2 text-sm rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-colors",
              compareMode ? "bg-primary text-primary-foreground border-transparent" : "border-border hover:bg-secondary"
            )}
          >
            <GitCompare className="w-4 h-4" />
            Compare
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Inputs Panel */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Simulator Controls</h2>

          <ScenarioSlider
            label="AC Setpoint"
            icon={Thermometer}
            value={inputs.acSetpoint}
            min={18} max={26} step={1} unit="°C"
            effect="Every 1°C saves ~₹1,200/mo"
            onChange={set("acSetpoint")}
          />
          <ScenarioSlider
            label="LED Conversion"
            icon={Zap}
            value={inputs.ledLights}
            min={0} max={200} step={10} unit=" lights"
            effect="₹320/light/month"
            onChange={set("ledLights")}
          />
          <ScenarioSlider
            label="Solar Share"
            icon={Sun}
            value={inputs.solarShare}
            min={0} max={60} step={5} unit="%"
            effect="Each 5% adds ~0.5 pts"
            onChange={set("solarShare")}
          />
          <ScenarioSlider
            label="Standby Devices Reduced"
            icon={Monitor}
            value={inputs.standbyReduced}
            min={0} max={200} step={10} unit=""
            effect="₹150/device/month"
            onChange={set("standbyReduced")}
          />
          <ScenarioSlider
            label="EV Charging Ports"
            icon={Zap}
            value={inputs.evChargers}
            min={0} max={30} step={2} unit=""
            effect="Reduces transport penalties"
            onChange={set("evChargers")}
          />
          <ScenarioSlider
            label="Waste Segregation Target"
            icon={Leaf}
            value={inputs.segregationTarget}
            min={20} max={100} step={5} unit="%"
            effect="Compliance drives waste score"
            onChange={set("segregationTarget")}
          />

          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" /> Lab Schedule Shift
              </label>
              <select
                value={inputs.labScheduleShift}
                onChange={(e) => set("labScheduleShift")(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>No change</option>
                <option>Morning shift</option>
                <option>Night shift</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-primary" /> Rainwater Harvesting
              </label>
              <button
                onClick={() => set("rainwaterHarvest")(!inputs.rainwaterHarvest)}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-xl border font-medium transition-all",
                  inputs.rainwaterHarvest
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-secondary text-muted-foreground border-border"
                )}
              >
                {inputs.rainwaterHarvest ? "Enabled (+3 pts)" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Projected Results</h2>
            <div className="flex justify-center">
              <GreenGauge score={result.score} size={180} />
            </div>

            {/* Delta */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {delta >= 0 ? (
                <div className="flex items-center gap-1.5 text-green-500 font-bold">
                  <TrendingUp className="w-5 h-5" />
                  <span>+{delta} points gained</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-500 font-bold">
                  <TrendingDown className="w-5 h-5" />
                  <span>{delta} points lost</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-green-500/10 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-lg">
                  <IndianRupee className="w-4 h-4" />
                  {(result.savings / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-muted-foreground">Monthly savings</div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                <div className="text-blue-600 font-bold text-lg">{result.co2} T</div>
                <div className="text-xs text-muted-foreground">CO₂/month reduced</div>
              </div>
            </div>

            {/* Category deltas */}
            <div className="mt-4 space-y-2">
              {Object.entries(result.breakdown).map(([cat, delta]) => (
                <div key={cat} className="flex items-center gap-2 text-xs">
                  <span className="capitalize text-muted-foreground w-16">{cat}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", delta >= 0 ? "bg-primary" : "bg-red-500")}
                      style={{ width: `${Math.min(100, Math.abs(delta) * 10)}%` }}
                    />
                  </div>
                  <span className={cn("font-medium w-10 text-right", delta >= 0 ? "text-green-600" : "text-red-500")}>
                    {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-5 space-y-2">
              {showSaveInput ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Scenario name..."
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && saveScenario()}
                    />
                    <button 
                      onClick={saveScenario} 
                      disabled={!scenarioName.trim()}
                      className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                  <button
                    onClick={() => { setShowSaveInput(false); setScenarioName(""); }}
                    className="w-full py-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4" /> Save Scenario
                  </button>
                  <button
                    onClick={() => {
                      setApplyTarget(!applyTarget);
                      if (!applyTarget) {
                        setTimeout(() => {
                          alert(`Target set to ${result.score} points!\n\nThis scenario is now your sustainability goal.`);
                        }, 100);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all",
                      applyTarget
                        ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30"
                        : "border-primary text-primary hover:bg-primary/10"
                    )}
                  >
                    <Target className="w-4 h-4" />
                    {applyTarget ? "✓ Target Applied!" : "Set as Target"}
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border-2 border-border hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" /> 
                    {exporting ? "Exporting..." : "Export Report PDF"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      {savedScenarios.length >= 2 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Scenario Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedScenarios.slice(-3).map((s, i) => (
              <div key={i} className="bg-muted rounded-xl p-4 space-y-3">
                <div className="font-semibold text-foreground text-sm">{s.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Green Index</span>
                  <span className="font-bold text-foreground">{s.result.score}/100</span>
                </div>
                <div className="h-1.5 bg-border rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${s.result.score}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-card rounded-lg p-2">
                    <div className="text-green-600 font-bold">₹{(s.result.savings / 1000).toFixed(1)}k</div>
                    <div className="text-muted-foreground">savings/mo</div>
                  </div>
                  <div className="bg-card rounded-lg p-2">
                    <div className="text-blue-600 font-bold">{s.result.co2} T</div>
                    <div className="text-muted-foreground">CO₂ cut</div>
                  </div>
                </div>
                <div className={cn(
                  "text-xs font-medium text-center py-1 rounded-lg",
                  s.result.score >= 80 ? "bg-green-500/15 text-green-600" :
                  s.result.score >= 70 ? "bg-yellow-500/15 text-yellow-600" : "bg-red-500/15 text-red-600"
                )}>
                  {s.result.score >= 80 ? "Excellent" : s.result.score >= 70 ? "Good" : "Needs Work"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedScenarios.length > 0 && savedScenarios.length < 2 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Save 2+ scenarios to enable side-by-side comparison
        </div>
      )}
    </div>
  );
}
