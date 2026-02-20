"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Droplets,
  Recycle,
  Bus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  FlaskConical,
  FileText,
  Bell,
  ChevronRight,
  Info,
  X,
  Shield,
  Leaf,
  TreePine,
  Sprout,
  Wind,
  Waves,
  Users,
  IndianRupee,
  TrendingDown as TrendingDownIcon,
  Target,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import GreenGauge from "@/components/dashboard/GreenGauge";
import Sparkline from "@/components/dashboard/Sparkline";
import EnergyMetrics from "@/components/dashboard/EnergyMetrics";
import { categoryScores, topIssues, latestAlerts, greenIndexScore } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  energy: Zap,
  water: Droplets,
  waste: Recycle,
  transport: Bus,
};

const categoryColors: Record<string, string> = {
  energy: "#eab308",
  water: "#3b82f6",
  waste: "#22c55e",
  transport: "#f97316",
};

const severityColors: Record<string, string> = {
  high: "text-red-500 bg-red-500/10",
  medium: "text-yellow-500 bg-yellow-500/10",
  low: "text-blue-400 bg-blue-400/10",
};

export default function DashboardPage() {
  const [resolveModal, setResolveModal] = useState<(typeof topIssues)[0] | null>(null);
  const [sourcesModal, setSourcesModal] = useState(false);
  const [liveDataModal, setLiveDataModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campus Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Main Campus · Last 7 days · Feb 12–19, 2026</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <button onClick={() => setLiveDataModal(true)} className="hover:underline">
            Live
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score Card */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 flex flex-col items-center glow-green">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-sm font-semibold text-foreground">Green Index Score</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-600">
              Good
            </span>
          </div>
          <GreenGauge score={greenIndexScore} size={200} />
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-green-500 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              +3.4 vs last period
            </div>
          </div>
          {/* Data confidence */}
          <div className="w-full mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Data Confidence</span>
              <button
                onClick={() => setSourcesModal(true)}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Info className="w-3 h-3" /> View sources
              </button>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
              <div className="bg-primary h-full rounded-l-full" style={{ width: "72%" }} />
              <div className="bg-yellow-400 h-full rounded-r-full" style={{ width: "28%" }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>72% sensor-based</span>
              <span>28% manual</span>
            </div>
          </div>
          <Link href="/analytics" className="mt-3 text-xs text-primary hover:underline">View breakdown →</Link>
        </div>

        {/* Quick Actions + Latest Alerts */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Plus, label: "Add Manual Data", href: "/data-input", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: FlaskConical, label: "Run What-If", href: "/simulator", color: "text-purple-500", bg: "bg-purple-500/10" },
                { icon: FileText, label: "Generate Report", href: "/reports", color: "text-orange-500", bg: "bg-orange-500/10" },
                { icon: Bell, label: "View Alerts", href: "/alerts", color: "text-red-500", bg: "bg-red-500/10" },
              ].map(({ icon: Icon, label, href, color, bg }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-all group"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
                    <Icon className={cn("w-5 h-5", color)} />
                  </div>
                  <span className="text-xs font-medium text-center text-foreground/80 group-hover:text-foreground">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest Alerts */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Latest Alerts</h2>
              <Link href="/alerts" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {latestAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  href="/alerts"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      alert.severity === "high" ? "bg-red-500" : alert.severity === "medium" ? "bg-yellow-500" : "bg-blue-400"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{alert.message}</div>
                    <div className="text-[10px] text-muted-foreground">{alert.zone} · {alert.type}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{alert.time}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Energy Metrics with Real Formulas */}
      <EnergyMetrics />

      {/* Category Cards */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Category Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryScores.map((cat) => {
            const Icon = categoryIcons[cat.id];
            const color = categoryColors[cat.id];
            const isUp = cat.change > 0;
            return (
              <div
                key={cat.id}
                className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{cat.label}</div>
                      <div
                        className={cn("text-xs flex items-center gap-0.5", isUp ? "text-green-500" : "text-red-500")}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}{cat.change}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{cat.score}</div>
                </div>

                {/* Score bar */}
                <div className="h-1.5 bg-muted rounded-full mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${cat.score}%`, backgroundColor: color }}
                  />
                </div>

                {/* Sparkline */}
                <div className="flex items-end justify-between">
                  <div className="text-xs text-muted-foreground leading-tight max-w-[55%]">{cat.driver}</div>
                  <Sparkline data={cat.trend} color={color} width={70} height={28} />
                </div>

                <Link
                  href={`/analytics?category=${cat.id}`}
                  className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Issues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Top Issues (Auto-generated)</h2>
          <span className="text-xs text-muted-foreground">Ranked by impact</span>
        </div>
        <div className="space-y-3">
          {topIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all flex items-center gap-4"
            >
              <div className={cn("px-2.5 py-1.5 rounded-lg text-xs font-bold", severityColors[issue.severity])}>
                {issue.impact} pts
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground">{issue.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{issue.zone}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{issue.description}</p>
              </div>
              <button
                onClick={() => setResolveModal(issue)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* De-carbonizer Index */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">De-carbonizer Index</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
              Actionable Steps
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Improve your Green Index</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 1,
              title: "Plant Native Trees",
              icon: TreePine,
              impact: "+2.5 pts",
              cost: "₹15,000",
              co2: "120 kg/year",
              difficulty: "Medium",
              time: "1 month",
              description: "Plant 50 native trees around campus perimeter",
              steps: ["Identify suitable locations", "Source native saplings", "Organize planting drive", "Set up watering schedule"],
              category: "Carbon Offset",
              color: "text-green-600 bg-green-500/10",
            },
            {
              id: 2,
              title: "Lake Cleaning Drive",
              icon: Waves,
              impact: "+1.8 pts",
              cost: "₹8,500",
              co2: "45 kg/year",
              difficulty: "Easy",
              time: "2 weeks",
              description: "Clean campus lake and install filtration system",
              steps: ["Remove debris and waste", "Install bio-filter", "Add aquatic plants", "Monthly maintenance plan"],
              category: "Water Conservation",
              color: "text-blue-600 bg-blue-500/10",
            },
            {
              id: 3,
              title: "Rooftop Solar Expansion",
              icon: Zap,
              impact: "+4.2 pts",
              cost: "₹2,50,000",
              co2: "850 kg/year",
              difficulty: "Hard",
              time: "3 months",
              description: "Install 50 kW solar panels on Block B rooftop",
              steps: ["Structural assessment", "Panel procurement", "Installation & wiring", "Grid connection"],
              category: "Renewable Energy",
              color: "text-yellow-600 bg-yellow-500/10",
            },
            {
              id: 4,
              title: "Composting Program",
              icon: Sprout,
              impact: "+1.5 pts",
              cost: "₹12,000",
              co2: "95 kg/year",
              difficulty: "Easy",
              time: "2 weeks",
              description: "Set up organic waste composting units in hostel zones",
              steps: ["Install compost bins", "Train hostel staff", "Create collection schedule", "Use compost in gardens"],
              category: "Waste Management",
              color: "text-green-600 bg-green-500/10",
            },
            {
              id: 5,
              title: "EV Charging Stations",
              icon: Bus,
              impact: "+3.1 pts",
              cost: "₹1,80,000",
              co2: "420 kg/year",
              difficulty: "Medium",
              time: "6 weeks",
              description: "Install 10 EV charging points in parking areas",
              steps: ["Electrical capacity check", "Charger procurement", "Installation", "Launch EV incentive program"],
              category: "Green Transport",
              color: "text-orange-600 bg-orange-500/10",
            },
            {
              id: 6,
              title: "Rainwater Harvesting",
              icon: Droplets,
              impact: "+2.8 pts",
              cost: "₹95,000",
              co2: "180 kg/year",
              difficulty: "Medium",
              time: "1 month",
              description: "Install rainwater collection system for 3 buildings",
              steps: ["Design collection system", "Install storage tanks", "Connect to plumbing", "Water quality testing"],
              category: "Water Conservation",
              color: "text-blue-600 bg-blue-500/10",
            },
          ].map((action) => {
            const Icon = action.icon;
            const isCompleted = completedActions.includes(action.id);
            return (
              <div
                key={action.id}
                className={cn(
                  "bg-card rounded-2xl border p-5 transition-all cursor-pointer hover:shadow-lg",
                  isCompleted ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/30"
                )}
                onClick={() => setSelectedAction(action)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Done
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-lg font-black text-primary">{action.impact}</div>
                      <div className="text-[10px] text-muted-foreground">Impact</div>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{action.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">Cost</div>
                    <div className="text-sm font-bold text-foreground">{action.cost}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">CO₂ Saved</div>
                    <div className="text-sm font-bold text-foreground">{action.co2}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-medium",
                    action.difficulty === "Easy" ? "bg-green-500/10 text-green-600" :
                    action.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-600" :
                    "bg-red-500/10 text-red-600"
                  )}>
                    {action.difficulty}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {action.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financials */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Financial Overview</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
              Cost Analysis
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Monthly breakdown</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Current Costs */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Current Costs</h3>
                <p className="text-xs text-muted-foreground">Monthly expenses</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { category: "Electricity", amount: "₹2,84,500", usage: "33,470 kWh", rate: "₹8.50/kWh", color: "text-yellow-600" },
                { category: "Water", amount: "₹45,200", usage: "1,88,000 L", rate: "₹0.24/L", color: "text-blue-600" },
                { category: "Waste Disposal", amount: "₹18,900", usage: "4,200 kg", rate: "₹4.50/kg", color: "text-green-600" },
                { category: "Transport Fuel", amount: "₹32,400", usage: "360 L", rate: "₹90/L", color: "text-orange-600" },
              ].map((item) => (
                <div key={item.category} className="pb-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{item.category}</span>
                    <span className="text-sm font-bold text-foreground">{item.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.usage}</span>
                    <span>{item.rate}</span>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t-2 border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total Monthly</span>
                  <span className="text-xl font-black text-red-600">₹3,81,000</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">₹45,72,000 annually</div>
              </div>
            </div>
          </div>

          {/* De-carbonization Costs */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">De-carbonization</h3>
                <p className="text-xs text-muted-foreground">Investment needed</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { action: "Solar Panel Installation", cost: "₹2,50,000", savings: "₹12,500/mo", payback: "20 months" },
                { action: "EV Charging Stations", cost: "₹1,80,000", savings: "₹8,100/mo", payback: "22 months" },
                { action: "Rainwater Harvesting", cost: "₹95,000", savings: "₹6,800/mo", payback: "14 months" },
                { action: "LED Conversion (200)", cost: "₹64,000", savings: "₹9,600/mo", payback: "7 months" },
                { action: "Tree Plantation (50)", cost: "₹15,000", savings: "₹2,400/mo", payback: "6 months" },
              ].map((item) => (
                <div key={item.action} className="pb-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{item.action}</span>
                    <span className="text-sm font-bold text-foreground">{item.cost}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 font-medium">{item.savings} saved</span>
                    <span className="text-muted-foreground">ROI: {item.payback}</span>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t-2 border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total Investment</span>
                  <span className="text-xl font-black text-green-600">₹6,04,000</span>
                </div>
                <div className="text-xs text-green-600 font-medium mt-1">₹39,400/mo savings</div>
              </div>
            </div>
          </div>

          {/* Projected Savings */}
          <div className="bg-card rounded-2xl border border-primary/30 p-5 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Projected Impact</h3>
                <p className="text-xs text-muted-foreground">After implementation</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">New Monthly Cost</div>
                <div className="text-2xl font-black text-primary">₹3,41,600</div>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                  <TrendingDownIcon className="w-3 h-3" />
                  ₹39,400 saved per month
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Annual Savings</div>
                <div className="text-2xl font-black text-green-600">₹4,72,800</div>
                <div className="text-xs text-muted-foreground mt-1">10.3% cost reduction</div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">CO₂ Reduction</div>
                <div className="text-2xl font-black text-blue-600">1,710 kg</div>
                <div className="text-xs text-muted-foreground mt-1">Per month reduction</div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Payback Period</div>
                <div className="text-2xl font-black text-orange-600">15 months</div>
                <div className="text-xs text-muted-foreground mt-1">Break-even timeline</div>
              </div>

              <div className="bg-primary/10 rounded-xl p-3 text-xs">
                <div className="flex items-center gap-1.5 text-primary font-semibold mb-1">
                  <Sparkles className="w-4 h-4" />
                  Green Index Boost
                </div>
                <div className="text-muted-foreground">
                  Implementing all actions will increase your Green Index from <span className="font-bold text-foreground">73</span> to <span className="font-bold text-primary">87</span> (+14 points)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Action Drawer */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-foreground">Action Drawer</h3>
              </div>
              <button onClick={() => setResolveModal(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">{resolveModal.title}</h4>
                <p className="text-sm text-muted-foreground">{resolveModal.description}</p>
              </div>
              <div className="bg-muted rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-medium">Suggested Fix</span>
                </div>
                <p className="text-sm text-muted-foreground">{resolveModal.suggestedFix}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 rounded-xl p-3 text-center">
                  <div className="text-green-600 font-bold text-sm">{resolveModal.estimatedSavings}</div>
                  <div className="text-xs text-muted-foreground">Est. savings</div>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                  <div className="text-blue-600 font-bold text-sm">{resolveModal.co2Reduction}</div>
                  <div className="text-xs text-muted-foreground">CO₂ reduction</div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Assign to</label>
                <select className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option>Block B Warden</option>
                  <option>Facilities Manager</option>
                  <option>Sustainability Officer</option>
                  <option>IT Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setResolveModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setResolveModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Create Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources Modal */}
      {sourcesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Data Sources</h3>
              </div>
              <button onClick={() => setSourcesModal(false)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground">
                The Green Index is calculated from a combination of IoT sensor readings and manual data submissions.
              </p>
              {[
                { label: "Energy meters", count: "12 active sensors", type: "sensor" },
                { label: "Water flow sensors", count: "8 active (1 offline)", type: "sensor" },
                { label: "Solar inverter", count: "Live feed", type: "sensor" },
                { label: "Waste segregation", count: "Manual entry (weekly)", type: "manual" },
                { label: "Transport data", count: "Manual entry (daily)", type: "manual" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.count}</div>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      s.type === "sensor" ? "bg-primary/15 text-primary" : "bg-yellow-500/15 text-yellow-600"
                    )}
                  >
                    {s.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Data Feed Modal */}
      {liveDataModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="font-bold text-foreground">Live Data Stream</h3>
              </div>
              <button onClick={() => setLiveDataModal(false)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-3">
                Real-time sensor updates • Refreshing every 5 seconds
              </div>
              {[
                { time: "11:42:15", sensor: "Energy Meter #3", value: "12.4 kW", zone: "Block B", status: "normal" },
                { time: "11:42:12", sensor: "Water Flow #5", value: "145 L/min", zone: "Hostel Zone", status: "normal" },
                { time: "11:42:08", sensor: "Solar Inverter", value: "8.2 kW", zone: "Main Campus", status: "normal" },
                { time: "11:42:05", sensor: "Energy Meter #7", value: "18.9 kW", zone: "Block B", status: "high" },
                { time: "11:42:01", sensor: "Water Flow #2", value: "98 L/min", zone: "Block A", status: "normal" },
                { time: "11:41:58", sensor: "Energy Meter #1", value: "9.1 kW", zone: "CSE Dept", status: "normal" },
                { time: "11:41:55", sensor: "Water Flow #8", value: "0 L/min", zone: "Lab Block", status: "offline" },
                { time: "11:41:52", sensor: "Energy Meter #5", value: "14.2 kW", zone: "Main Campus", status: "normal" },
              ].map((entry, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    entry.status === "high" ? "border-red-500/30 bg-red-500/5" :
                    entry.status === "offline" ? "border-yellow-500/30 bg-yellow-500/5" :
                    "border-border bg-muted/30"
                  )}
                >
                  <div className="text-xs text-muted-foreground w-16 flex-shrink-0">{entry.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{entry.sensor}</div>
                    <div className="text-xs text-muted-foreground">{entry.zone}</div>
                  </div>
                  <div className={cn(
                    "text-sm font-bold flex-shrink-0",
                    entry.status === "high" ? "text-red-500" :
                    entry.status === "offline" ? "text-yellow-500" :
                    "text-primary"
                  )}>
                    {entry.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border text-center">
              <button 
                onClick={() => setLiveDataModal(false)}
                className="text-xs text-primary hover:underline"
              >
                View all sensors in Data Input →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Detail Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = selectedAction.icon;
                  return <Icon className="w-5 h-5 text-primary" />;
                })()}
                <h3 className="font-bold text-foreground">{selectedAction.title}</h3>
              </div>
              <button onClick={() => setSelectedAction(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Overview */}
              <div>
                <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-primary/10 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-primary">{selectedAction.impact}</div>
                  <div className="text-xs text-muted-foreground">Green Index</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-green-600">{selectedAction.cost}</div>
                  <div className="text-xs text-muted-foreground">Investment</div>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-blue-600">{selectedAction.co2}</div>
                  <div className="text-xs text-muted-foreground">CO₂ Saved</div>
                </div>
                <div className="bg-orange-500/10 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-orange-600">{selectedAction.time}</div>
                  <div className="text-xs text-muted-foreground">Timeline</div>
                </div>
              </div>

              {/* Implementation Steps */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Implementation Steps
                </h4>
                <div className="space-y-2">
                  {selectedAction.steps.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-sm text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category & Difficulty */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Category:</span>
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", selectedAction.color)}>
                    {selectedAction.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Difficulty:</span>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    selectedAction.difficulty === "Easy" ? "bg-green-500/10 text-green-600" :
                    selectedAction.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-600" :
                    "bg-red-500/10 text-red-600"
                  )}>
                    {selectedAction.difficulty}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border hover:bg-secondary transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setCompletedActions(prev => [...prev, selectedAction.id]);
                    setSelectedAction(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
