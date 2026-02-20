"use client";

import { useState } from "react";
import {
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle,
  Eye, UserCheck, X, Clock, MapPin, Filter,
  ChevronDown, Upload, FileText,
} from "lucide-react";
import { alertsData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type AlertStatus = "Open" | "In Progress" | "Closed";
type AlertSeverity = "high" | "medium" | "low";

const severityConfig = {
  high: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertTriangle, label: "High" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: AlertCircle, label: "Medium" },
  low: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", icon: Info, label: "Low" },
};

const statusConfig = {
  "Open": { color: "text-red-500 bg-red-500/10", label: "Open" },
  "In Progress": { color: "text-yellow-500 bg-yellow-500/10", label: "In Progress" },
  "Closed": { color: "text-green-500 bg-green-500/10", label: "Closed" },
};

export default function AlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<(typeof alertsData)[0] | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [statuses, setStatuses] = useState<Record<number, AlertStatus>>(() =>
    Object.fromEntries(alertsData.map((a) => [a.id, a.status as AlertStatus]))
  );
  const [notes, setNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  const filtered = alertsData.filter((a) => {
    const typeMatch = filter === "All" || a.type === filter;
    const statusMatch = statusFilter === "All" || statuses[a.id] === statusFilter;
    return typeMatch && statusMatch;
  });

  const openCount = Object.values(statuses).filter((s) => s === "Open").length;
  const inProgressCount = Object.values(statuses).filter((s) => s === "In Progress").length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Alerts & Operations
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Real-time anomaly detection and action management</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
        {[
          { label: "Open", count: openCount, color: "text-red-500 bg-red-500/10 border-red-500/20" },
          { label: "In Progress", count: inProgressCount, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
          { label: "Closed", count: alertsData.length - openCount - inProgressCount, color: "text-green-500 bg-green-500/10 border-green-500/20" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border p-4 text-center", s.color)}>
            <div className="text-3xl font-black">{s.count}</div>
            <div className="text-sm font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["All", "Energy", "Water", "Waste", "Transport"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
              filter === f ? "bg-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {["All", "Open", "In Progress", "Closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                statusFilter === s ? "bg-secondary text-foreground border-primary/40" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Severity", "Time", "Zone", "Type", "Cause", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => {
                const sev = severityConfig[alert.severity as AlertSeverity];
                const SevIcon = sev.icon;
                const status = statuses[alert.id];
                return (
                  <tr
                    key={alert.id}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg w-fit", sev.bg, sev.color)}>
                        <SevIcon className="w-3.5 h-3.5" />
                        {sev.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{alert.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {alert.zone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded">{alert.type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{alert.cause}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusConfig[status].color)}>
                        {statusConfig[status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {status === "Open" && (
                          <button
                            onClick={() => setStatuses((p) => ({ ...p, [alert.id]: "In Progress" }))}
                            className="p-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors text-muted-foreground hover:text-yellow-500"
                            title="Acknowledge"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {status !== "Closed" && (
                          <button
                            onClick={() => setStatuses((p) => ({ ...p, [alert.id]: "Closed" }))}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors text-muted-foreground hover:text-green-500"
                            title="Close"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Detail Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-4">
          <div className="bg-card border-l border-border shadow-2xl w-full sm:w-[420px] h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn("w-5 h-5", severityConfig[selectedAlert.severity as AlertSeverity].color)} />
                <h3 className="font-bold text-foreground">Alert Details</h3>
              </div>
              <button onClick={() => setSelectedAlert(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Zone", value: selectedAlert.zone },
                  { label: "Type", value: selectedAlert.type },
                  { label: "Time", value: selectedAlert.time },
                  { label: "Status", value: statuses[selectedAlert.id] },
                ].map((m) => (
                  <div key={m.label} className="bg-muted rounded-xl p-3">
                    <div className="text-xs text-muted-foreground">{m.label}</div>
                    <div className="font-medium text-sm text-foreground">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Cause & Evidence */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                <div className="text-xs font-semibold text-red-500 mb-1">Trigger Rule</div>
                <p className="text-sm text-foreground">{selectedAlert.rule}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <div className="text-xs font-semibold text-muted-foreground mb-1">Evidence</div>
                <p className="text-sm text-foreground">{selectedAlert.evidence}</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <div className="text-xs font-semibold text-primary mb-1">Suggested Action</div>
                <p className="text-sm text-foreground">{selectedAlert.action}</p>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add resolution notes..."
                  className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Attachment */}
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground">Upload photo proof</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => {
                    if (el && !fileInputRef) {
                      (fileInputRef as any) = el;
                    }
                  }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFile(e.target.files[0].name);
                    }
                  }}
                />
                <button
                  onClick={() => (fileInputRef as any)?.click()}
                  className="mt-1.5 text-xs text-primary hover:underline"
                >
                  Browse files
                </button>
                {uploadedFile && (
                  <div className="mt-2 text-xs text-green-600 font-medium">✓ {uploadedFile}</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStatuses((p) => ({ ...p, [selectedAlert.id]: "Closed" }));
                    setNotes("");
                    setUploadedFile(null);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Close Alert
                </button>
                <button
                  onClick={() => {
                    setStatuses((p) => ({ ...p, [selectedAlert.id]: "In Progress" }));
                    setNotes("");
                    setUploadedFile(null);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-border hover:bg-secondary transition-colors"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
