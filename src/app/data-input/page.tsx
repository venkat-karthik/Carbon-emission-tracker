"use client";

import { useState } from "react";
import {
  Database, Wifi, WifiOff, AlertTriangle, CheckCircle,
  Plus, RefreshCw, Upload, FileText, ClipboardList,
  Trash2, Edit, Settings, Activity,
} from "lucide-react";
import { sensorsData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const healthConfig = {
  Good: { color: "text-green-500", bg: "bg-green-500/10", dot: "bg-green-500" },
  Warning: { color: "text-yellow-500", bg: "bg-yellow-500/10", dot: "bg-yellow-500" },
  Faulty: { color: "text-red-500", bg: "bg-red-500/10", dot: "bg-red-500" },
};

const tabs = ["Sensor Data", "Manual Data", "Upload CSV", "Data Audit"];

export default function DataInputPage() {
  const [activeTab, setActiveTab] = useState("Sensor Data");
  const [formState, setFormState] = useState({
    wasteZone: "Hostel Zone",
    wasteSeg: 65,
    waterTanker: "",
    recyclingWeight: "",
    eventName: "",
    eventCategory: "Energy",
    eventValue: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [csvFile, setCsvFile] = useState<string | null>(null);
  const [csvValidated, setCsvValidated] = useState(false);
  const [csvImported, setCsvImported] = useState(false);
  const [calibrating, setCalibrating] = useState<string | null>(null);
  const [pinging, setPinging] = useState<string | null>(null);
  const [faultyMarked, setFaultyMarked] = useState<string[]>([]);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [auditActions, setAuditActions] = useState<Record<string, "Approved" | "Rejected">>({});

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          Data Input
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage sensor feeds, manual entries, and bulk uploads</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-card border border-border rounded-xl w-fit">
        {tabs.map((t) => (
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

      {/* Sensor Data Tab */}
      {activeTab === "Sensor Data" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{sensorsData.length} sensors registered · {sensorsData.filter(s => s.health === "Good").length} active</div>
            <button 
              onClick={() => setShowAddSensor(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Sensor
            </button>
          </div>
          {showAddSensor && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">Add New Sensor</span>
                <button onClick={() => setShowAddSensor(false)} className="text-muted-foreground hover:text-foreground">×</button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Contact IT Admin to register a new IoT sensor device.</p>
              <button 
                onClick={() => setShowAddSensor(false)}
                className="w-full py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground"
              >
                Request Sensor Registration
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sensorsData.map((sensor) => {
              const hcfg = healthConfig[sensor.health as keyof typeof healthConfig];
              return (
                <div
                  key={sensor.id}
                  className={cn(
                    "bg-card rounded-xl border p-4 transition-all",
                    sensor.health === "Faulty" ? "border-red-500/30" : sensor.health === "Warning" ? "border-yellow-500/30" : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", hcfg.dot)} />
                        <span className="font-semibold text-sm text-foreground">{sensor.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{sensor.id} · {sensor.zone} · {sensor.category}</div>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", hcfg.bg, hcfg.color)}>
                      {sensor.health}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-muted rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">Reading</div>
                      <div className="font-bold text-sm text-foreground">{sensor.reading}</div>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">Last Ping</div>
                      <div className="font-bold text-sm text-foreground">{sensor.lastPing}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => {
                        setCalibrating(sensor.id);
                        setTimeout(() => setCalibrating(null), 1500);
                      }}
                      disabled={calibrating === sensor.id}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3 h-3", calibrating === sensor.id && "animate-spin")} /> 
                      {calibrating === sensor.id ? "Calibrating..." : "Calibrate"}
                    </button>
                    <button 
                      onClick={() => {
                        setPinging(sensor.id);
                        setTimeout(() => setPinging(null), 1000);
                      }}
                      disabled={pinging === sensor.id}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Activity className="w-3 h-3" /> 
                      {pinging === sensor.id ? "Pinging..." : "Test Ping"}
                    </button>
                    {sensor.health !== "Faulty" && !faultyMarked.includes(sensor.id) && (
                      <button 
                        onClick={() => setFaultyMarked(prev => [...prev, sensor.id])}
                        className="text-xs py-1.5 px-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                      </button>
                    )}
                    {faultyMarked.includes(sensor.id) && (
                      <div className="text-xs py-1.5 px-2 rounded-lg bg-red-500/20 text-red-600 font-medium">
                        Marked Faulty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Data Tab */}
      {activeTab === "Manual Data" && (
        <div className="max-w-xl space-y-5">
          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div className="font-bold text-foreground">Data Submitted</div>
              <p className="text-sm text-muted-foreground">Your manual entry has been submitted for approval.</p>
              <button onClick={() => setSubmitted(false)} className="mt-2 text-sm text-primary hover:underline">Submit another entry</button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Manual Data Entry</h2>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Zone</label>
                <select
                  value={formState.wasteZone}
                  onChange={(e) => setFormState((p) => ({ ...p, wasteZone: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {["Hostel Zone", "Block A", "Block B", "CSE Dept", "Main Campus"].map((z) => <option key={z}>{z}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Waste Segregation %</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={0} max={100} step={5}
                    value={formState.wasteSeg}
                    onChange={(e) => setFormState((p) => ({ ...p, wasteSeg: Number(e.target.value) }))}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-12 text-sm font-bold text-primary text-right">{formState.wasteSeg}%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Water Tanker Usage (Litres)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={formState.waterTanker}
                  onChange={(e) => setFormState((p) => ({ ...p, waterTanker: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Recycling Collection Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={formState.recyclingWeight}
                  onChange={(e) => setFormState((p) => ({ ...p, recyclingWeight: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Event Name (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Earth Day"
                    value={formState.eventName}
                    onChange={(e) => setFormState((p) => ({ ...p, eventName: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={formState.eventCategory}
                    onChange={(e) => setFormState((p) => ({ ...p, eventCategory: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {["Energy", "Water", "Waste", "Transport"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    // Save draft logic
                    alert("Draft saved locally");
                  }}
                  className="flex-1 py-2.5 text-sm rounded-xl border border-border text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => setSubmitted(true)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSV Upload Tab */}
      {activeTab === "Upload CSV" && (
        <div className="max-w-xl space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Bulk CSV Upload</h2>
            <div className="bg-muted rounded-xl p-3 text-xs font-mono text-muted-foreground">
              Expected columns: <span className="text-primary">timestamp, zone, category, value, source</span>
            </div>

            {!csvFile ? (
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-all"
                onClick={() => setCsvFile("sample_data.csv")}
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium text-foreground">Drop CSV here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .csv files up to 10MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl">
                  <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{csvFile}</div>
                    <div className="text-xs text-muted-foreground">842 rows · 5 columns · 48KB</div>
                  </div>
                  <button onClick={() => { setCsvFile(null); setCsvValidated(false); setCsvImported(false); }}>
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
                  </button>
                </div>

                {csvValidated && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4" /> Validation Passed
                    </div>
                    <div className="text-muted-foreground">842 valid rows · 0 errors · Schema matched</div>
                  </div>
                )}

                {csvImported && (
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-xs text-primary font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> 842 records imported successfully
                  </div>
                )}

                <div className="flex gap-2">
                  {!csvValidated && (
                    <button
                      onClick={() => setCsvValidated(true)}
                      className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-border hover:bg-secondary transition-colors"
                    >
                      Validate
                    </button>
                  )}
                  {csvValidated && !csvImported && (
                    <button
                      onClick={() => setCsvImported(true)}
                      className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Import Data
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Audit Tab */}
      {activeTab === "Data Audit" && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Recent manual data submissions pending review</div>
          {[
            { id: "M001", submitter: "Block B Warden", zone: "Block B", category: "Waste", value: "72% segregation", time: "2h ago", status: "Pending" },
            { id: "M002", submitter: "CSE Faculty", zone: "CSE Dept", category: "Energy", value: "12 kWh standby", time: "5h ago", status: "Approved" },
            { id: "M003", submitter: "Hostel Admin", zone: "Hostel Zone", category: "Water", value: "8000L tanker", time: "1d ago", status: "Rejected" },
            { id: "M004", submitter: "Sustainability Cell", zone: "Main Campus", category: "Transport", value: "45 EV trips", time: "1d ago", status: "Approved" },
          ].map((entry) => (
            <div key={entry.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{entry.submitter}</span>
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{entry.id}</span>
                </div>
                <div className="text-xs text-muted-foreground">{entry.zone} · {entry.category} · {entry.value} · {entry.time}</div>
              </div>
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                auditActions[entry.id] === "Approved" ? "bg-green-500/10 text-green-600" :
                auditActions[entry.id] === "Rejected" ? "bg-red-500/10 text-red-600" :
                entry.status === "Approved" ? "bg-green-500/10 text-green-600" :
                entry.status === "Rejected" ? "bg-red-500/10 text-red-600" : "bg-yellow-500/10 text-yellow-600"
              )}>
                {auditActions[entry.id] || entry.status}
              </span>
              {entry.status === "Pending" && !auditActions[entry.id] && (
                <div className="flex gap-1">
                  <button 
                    onClick={() => setAuditActions(prev => ({ ...prev, [entry.id]: "Approved" }))}
                    className="px-2.5 py-1.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => setAuditActions(prev => ({ ...prev, [entry.id]: "Rejected" }))}
                    className="px-2.5 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
