"use client";

import { useState } from "react";
import { FileText, Download, Share2, ChevronDown, X } from "lucide-react";
import { reportGenerator, ReportConfig } from "@/lib/report-generator";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [zone, setZone] = useState("Main Campus");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");

  const config: ReportConfig = {
    zone,
    dateRange,
    includeCharts,
    includeRecommendations,
    includeRawData,
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      await reportGenerator.generatePDF(config);
      alert('PDF report generated successfully!');
    } catch (error) {
      alert('Error generating PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCSV = () => {
    setGenerating(true);
    try {
      reportGenerator.generateCSV(config);
      alert('CSV report exported successfully!');
    } catch (error) {
      alert('Error generating CSV: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      const qrDataURL = await reportGenerator.generateQRCode(config);
      setQrCode(qrDataURL);
      setQrModalOpen(true);
    } catch (error) {
      alert('Error generating QR code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Build, preview, and export sustainability reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Builder */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Report Builder</h2>

            {/* Zone Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>Main Campus</option>
                <option>Block A</option>
                <option>Block B</option>
                <option>Hostel Zone</option>
                <option>CSE Dept</option>
                <option>Lab Block</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 6 months</option>
                <option>Last year</option>
              </select>
            </div>

            {/* Include Sections */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">Include Sections</label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Charts & Visualizations</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Recommendations</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Raw Data Appendix (Admin)</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>

            {/* Export Options */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                onClick={handleGeneratePDF}
                disabled={generating}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
              >
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">PDF</span>
              </button>
              <button
                onClick={handleGenerateCSV}
                disabled={generating}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">CSV</span>
              </button>
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Share2 className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border p-6">
            {/* Report Header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">GreenIndex Report</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{zone}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {dateRange} · Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-primary">73</div>
                <div className="text-sm text-muted-foreground">Green Index</div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500/10 rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Score Change</div>
                <div className="text-2xl font-bold text-green-600">+3.4 pts</div>
                <div className="text-xs text-muted-foreground">vs Last Period</div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Monthly Savings</div>
                <div className="text-2xl font-bold text-blue-600">₹42,800</div>
                <div className="text-xs text-muted-foreground">Cost Reduction</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">CO₂ Reduced</div>
                <div className="text-2xl font-bold text-green-600">847 kg</div>
                <div className="text-xs text-muted-foreground">This Period</div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Category Scores</h3>
              <div className="space-y-3">
                {[
                  { name: 'Energy', score: 68, color: 'bg-yellow-500' },
                  { name: 'Water', score: 74, color: 'bg-blue-500' },
                  { name: 'Waste', score: 61, color: 'bg-green-500' },
                  { name: 'Transport', score: 79, color: 'bg-orange-500' },
                ].map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-foreground">{cat.name}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${cat.score}%` }} />
                    </div>
                    <div className="w-12 text-sm font-bold text-foreground text-right">{cat.score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Issues */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Top Issues Identified</h3>
              <div className="space-y-2">
                {[
                  { title: 'Block B peak usage +18%', impact: '-6 pts', zone: 'Block B' },
                  { title: 'Waste segregation missing in Hostel 2', impact: '-4 pts', zone: 'Hostel Zone' },
                  { title: 'Water leak suspected in Lab Block', impact: '-3 pts', zone: 'Lab Block' },
                ].map((issue, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-1 h-8 bg-red-500 rounded-full" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{issue.title}</div>
                      <div className="text-xs text-muted-foreground">{issue.zone}</div>
                    </div>
                    <div className="text-sm font-bold text-red-600">{issue.impact}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Tracker */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Actions Tracker</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-500/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">3</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">7</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">4</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Data last updated: Feb 19, 2026 – 11:42 AM</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Share Report</h3>
              </div>
              <button onClick={() => setQrModalOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code to view the report
              </p>
              {qrCode && (
                <img src={qrCode} alt="QR Code" className="mx-auto rounded-lg border border-border" />
              )}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Zone: {zone}</p>
                <p className="text-xs text-muted-foreground">Period: {dateRange}</p>
                <p className="text-xs text-muted-foreground">Score: 73</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

