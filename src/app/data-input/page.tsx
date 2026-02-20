"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle, AlertCircle, Download, X, FileText, TrendingUp, Activity, RefreshCw, Wifi, WifiOff, Database, Plus, Trash2 } from "lucide-react";
import { csvProcessor, CSV_EXAMPLE, ProcessedCSVData } from "@/lib/csv-processor";
import { cn } from "@/lib/utils";

export default function DataInputPage() {
  const [activeTab, setActiveTab] = useState("csv");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ProcessedCSVData | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sensorsData, setSensorsData] = useState<any[]>([]);

  // Fetch sensors data
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch("/api/sensors");
        const data = await res.json();
        if (data.success) {
          setSensorsData(data.sensorsData);
        }
      } catch (error) {
        console.error("Failed to fetch sensors data:", error);
      }
    };
    fetchSensors();
  }, []);

  // Sensor tab states
  const [calibrating, setCalibrating] = useState<string | null>(null);
  const [pinging, setPinging] = useState<string | null>(null);

  // Manual data tab states
  const [manualData, setManualData] = useState({
    zone: "Main Campus",
    category: "Energy",
    value: "",
    notes: "",
  });
  const [manualSubmitted, setManualSubmitted] = useState(false);

  // Audit tab states
  const [auditEntries] = useState([
    { id: "A001", submitter: "Admin", zone: "Block B", category: "Energy", value: "4.8 kWh", time: "2h ago", status: "Pending" },
    { id: "A002", submitter: "Warden", zone: "Hostel Zone", category: "Waste", value: "48 kg", time: "5h ago", status: "Approved" },
    { id: "A003", submitter: "Lab Tech", zone: "Block A", category: "Water", value: "2.4 L/min", time: "1d ago", status: "Rejected" },
    { id: "A004", submitter: "Faculty", zone: "CSE Dept", category: "Energy", value: "1.2 kWh", time: "1d ago", status: "Approved" },
  ]);
  const [auditActions, setAuditActions] = useState<Record<string, "Approved" | "Rejected">>({});

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploading(true);

    try {
      const content = await file.text();
      const result = csvProcessor.processCSVData(content);
      setUploadResult(result);

      // Show success message
      if (result.validRows > 0) {
        alert(`Successfully processed ${result.validRows} rows!\nData is now reflected across all dashboards.`);
      }
    } catch (error) {
      alert(`Error processing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const downloadExample = () => {
    const blob = new Blob([CSV_EXAMPLE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greenindex-example.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCalibrate = (sensorId: string) => {
    setCalibrating(sensorId);
    setTimeout(() => {
      setCalibrating(null);
      alert(`Sensor ${sensorId} calibrated successfully`);
    }, 1500);
  };

  const handlePing = (sensorId: string) => {
    setPinging(sensorId);
    setTimeout(() => {
      setPinging(null);
      alert(`Sensor ${sensorId} responded: OK`);
    }, 1000);
  };

  const handleManualSubmit = () => {
    if (!manualData.value) {
      alert('Please enter a value');
      return;
    }
    setManualSubmitted(true);
    setTimeout(() => {
      setManualSubmitted(false);
      setManualData({ zone: "Main Campus", category: "Energy", value: "", notes: "" });
    }, 3000);
  };

  const handleAuditAction = (entryId: string, action: "Approved" | "Rejected") => {
    setAuditActions(prev => ({ ...prev, [entryId]: action }));
  };

  const stats = csvProcessor.getStatistics();

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Input</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage sensor feeds, manual entries, and bulk uploads</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("sensor")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "sensor"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Sensor Data
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "manual"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Manual Data
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "csv"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Upload CSV
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "audit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Data Audit
        </button>
      </div>

      {/* CSV Upload Tab */}
      {activeTab === "csv" && (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Bulk CSV Upload</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Expected columns: timestamp, zone, category, value, source
                </p>
              </div>
              <button
                onClick={downloadExample}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Example
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all",
                dragActive ? "border-primary bg-primary/5" : "border-border",
                uploading && "opacity-50 pointer-events-none"
              )}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                id="csv-upload"
                disabled={uploading}
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {uploading ? "Processing..." : "Drop CSV here or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports csv files up to 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                {uploadResult.validRows > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <h3 className="font-semibold text-foreground">Upload Results</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">{uploadResult.totalRows}</div>
                  <div className="text-xs text-muted-foreground">Total Rows</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{uploadResult.validRows}</div>
                  <div className="text-xs text-muted-foreground">Valid Rows</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{uploadResult.invalidRows}</div>
                  <div className="text-xs text-muted-foreground">Invalid Rows</div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{uploadResult.zones.length}</div>
                  <div className="text-xs text-muted-foreground">Zones</div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Category Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(uploadResult.categories).map(([category, count]) => (
                    <div key={category} className="bg-muted rounded-lg p-3">
                      <div className="text-lg font-bold text-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground capitalize">{category}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Date Range</h4>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <span className="text-foreground">
                    {uploadResult.dateRange.start.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground mx-2">→</span>
                  <span className="text-foreground">
                    {uploadResult.dateRange.end.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Zones */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Zones Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {uploadResult.zones.map(zone => (
                    <span key={zone} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {uploadResult.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-600 mb-3">Errors ({uploadResult.errors.length})</h4>
                  <div className="bg-red-500/10 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {uploadResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-xs text-red-600 mb-1">
                        {error}
                      </div>
                    ))}
                    {uploadResult.errors.length > 10 && (
                      <div className="text-xs text-red-600 font-semibold mt-2">
                        ... and {uploadResult.errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadResult.validRows > 0 && (
                <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-600 mb-1">Data Successfully Integrated!</div>
                      <div className="text-sm text-muted-foreground">
                        Your uploaded data is now reflected across:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Dashboard - Updated metrics and scores</li>
                          <li>Analytics - New data points in charts</li>
                          <li>Alerts - Wastage detection running</li>
                          <li>Reports - Available for export</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current Data Statistics */}
          {stats.totalRecords > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Current Data Statistics</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">{stats.totalRecords}</div>
                  <div className="text-xs text-muted-foreground">Total Records</div>
                </div>
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <div key={category} className="bg-muted rounded-lg p-4">
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted-foreground capitalize">{category}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Average Values</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(stats.averageValues).map(([category, avg]) => (
                    <div key={category} className="bg-muted rounded-lg p-3">
                      <div className="text-lg font-bold text-primary">{avg}</div>
                      <div className="text-xs text-muted-foreground capitalize">{category}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('Clear all uploaded data?')) {
                    csvProcessor.clearData();
                    setUploadResult(null);
                  }
                }}
                className="mt-6 px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sensor Data Tab */}
      {activeTab === "sensor" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {sensorsData.length} sensors registered · {sensorsData.filter(s => s.health === "Good").length} active
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors">
              <Plus className="w-4 h-4" />
              Add Sensor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensorsData.map((sensor) => (
              <div
                key={sensor.id}
                className={cn(
                  "bg-card rounded-2xl border p-5 transition-all",
                  sensor.health === "Faulty" ? "border-red-500/30" :
                    sensor.health === "Warning" ? "border-yellow-500/30" : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {sensor.health === "Good" && <Wifi className="w-4 h-4 text-green-500" />}
                      {sensor.health === "Warning" && <Activity className="w-4 h-4 text-yellow-500" />}
                      {sensor.health === "Faulty" && <WifiOff className="w-4 h-4 text-red-500" />}
                      <span className="font-semibold text-foreground">{sensor.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sensor.id} · {sensor.zone} · {sensor.category}
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    sensor.health === "Good" && "bg-green-500/10 text-green-600",
                    sensor.health === "Warning" && "bg-yellow-500/10 text-yellow-600",
                    sensor.health === "Faulty" && "bg-red-500/10 text-red-600"
                  )}>
                    {sensor.health}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Reading</div>
                    <div className="font-bold text-foreground">{sensor.reading}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Last Ping</div>
                    <div className="font-bold text-foreground">{sensor.lastPing}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCalibrate(sensor.id)}
                    disabled={calibrating === sensor.id || sensor.health === "Faulty"}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", calibrating === sensor.id && "animate-spin")} />
                    {calibrating === sensor.id ? "Calibrating..." : "Calibrate"}
                  </button>
                  <button
                    onClick={() => handlePing(sensor.id)}
                    disabled={pinging === sensor.id || sensor.health === "Faulty"}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    {pinging === sensor.id ? "Pinging..." : "Test Ping"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Data Tab */}
      {activeTab === "manual" && (
        <div className="max-w-2xl mx-auto">
          {manualSubmitted ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Data Submitted Successfully</h3>
              <p className="text-sm text-muted-foreground">
                Your manual entry has been recorded and will be reflected in the dashboard shortly.
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Manual Data Entry</h3>
                <p className="text-xs text-muted-foreground">
                  Enter sustainability data manually when sensors are unavailable
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Zone</label>
                  <select
                    value={manualData.zone}
                    onChange={(e) => setManualData({ ...manualData, zone: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option>Main Campus</option>
                    <option>Block A</option>
                    <option>Block B</option>
                    <option>Hostel Zone</option>
                    <option>CSE Dept</option>
                    <option>Lab Block</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                  <select
                    value={manualData.category}
                    onChange={(e) => setManualData({ ...manualData, category: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option>Energy</option>
                    <option>Water</option>
                    <option>Waste</option>
                    <option>Transport</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Value {manualData.category === "Energy" && "(kWh)"}
                    {manualData.category === "Water" && "(L)"}
                    {manualData.category === "Waste" && "(kg)"}
                    {manualData.category === "Transport" && "(trips)"}
                  </label>
                  <input
                    type="number"
                    value={manualData.value}
                    onChange={(e) => setManualData({ ...manualData, value: e.target.value })}
                    placeholder="Enter value"
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Notes (Optional)</label>
                  <textarea
                    value={manualData.notes}
                    onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                    placeholder="Add any additional context or notes"
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setManualData({ zone: "Main Campus", category: "Energy", value: "", notes: "" })}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleManualSubmit}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Submit Data
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Audit Tab */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Recent manual data submissions pending review
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded">
                {auditEntries.filter(e => e.status === "Pending" && !auditActions[e.id]).length} Pending
              </span>
              <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">
                {auditEntries.filter(e => e.status === "Approved" || auditActions[e.id] === "Approved").length} Approved
              </span>
              <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded">
                {auditEntries.filter(e => e.status === "Rejected" || auditActions[e.id] === "Rejected").length} Rejected
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{entry.submitter}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{entry.id}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{entry.time}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.zone} · {entry.category} · {entry.value}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap",
                      (auditActions[entry.id] === "Approved" || (entry.status === "Approved" && !auditActions[entry.id])) && "bg-green-500/10 text-green-600",
                      (auditActions[entry.id] === "Rejected" || (entry.status === "Rejected" && !auditActions[entry.id])) && "bg-red-500/10 text-red-600",
                      entry.status === "Pending" && !auditActions[entry.id] && "bg-yellow-500/10 text-yellow-600"
                    )}>
                      {auditActions[entry.id] || entry.status}
                    </span>

                    {entry.status === "Pending" && !auditActions[entry.id] && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAuditAction(entry.id, "Approved")}
                          className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAuditAction(entry.id, "Rejected")}
                          className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other tabs remain the same... */}
      {activeTab !== "csv" && activeTab !== "sensor" && activeTab !== "manual" && activeTab !== "audit" && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {activeTab === "sensor" && "Sensor data management coming soon"}
            {activeTab === "manual" && "Manual data entry coming soon"}
            {activeTab === "audit" && "Data audit coming soon"}
          </p>
        </div>
      )}
    </div>
  );
}


