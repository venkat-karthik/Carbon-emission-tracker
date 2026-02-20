"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Leaf,
  Calendar,
  MapPin,
  X,
} from "lucide-react";
import { campuses, dateRanges } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const notifications = [
  { id: 1, title: "Energy spike in Block B", time: "2h ago", severity: "high" },
  { id: 2, title: "Waste compliance dropped", time: "4h ago", severity: "high" },
  { id: 3, title: "Water anomaly detected", time: "6h ago", severity: "medium" },
];

// Search data for local filtering
const searchableItems = [
  { title: "Dashboard", type: "Page", url: "/", keywords: ["home", "overview", "main"] },
  { title: "Analytics", type: "Page", url: "/analytics", keywords: ["charts", "data", "insights"] },
  { title: "What-If Simulator", type: "Page", url: "/simulator", keywords: ["simulation", "scenario", "forecast"] },
  { title: "Leaderboard", type: "Page", url: "/leaderboard", keywords: ["rankings", "competition", "scores"] },
  { title: "Alerts", type: "Page", url: "/alerts", keywords: ["notifications", "warnings", "issues"] },
  { title: "Data Input", type: "Page", url: "/data-input", keywords: ["sensors", "manual", "upload"] },
  { title: "Reports", type: "Page", url: "/reports", keywords: ["export", "pdf", "csv"] },
  { title: "Admin Settings", type: "Page", url: "/admin", keywords: ["configuration", "settings", "rules"] },
  { title: "Energy Score: 68", type: "Metric", url: "/analytics?category=energy", keywords: ["energy", "power", "electricity"] },
  { title: "Water Score: 74", type: "Metric", url: "/analytics?category=water", keywords: ["water", "consumption"] },
  { title: "Waste Score: 61", type: "Metric", url: "/analytics?category=waste", keywords: ["waste", "recycling", "segregation"] },
  { title: "Transport Score: 79", type: "Metric", url: "/analytics?category=transport", keywords: ["transport", "ev", "vehicles"] },
  { title: "Block B Energy Spike", type: "Alert", url: "/alerts", keywords: ["block b", "spike", "energy"] },
  { title: "Main Campus", type: "Zone", url: "/analytics?zone=main", keywords: ["main", "campus"] },
  { title: "Hostel Zone", type: "Zone", url: "/analytics?zone=hostel", keywords: ["hostel", "dormitory"] },
];

export default function Navbar() {
  const [campus, setCampus] = useState("Main Campus");
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [showCampus, setShowCampus] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof searchableItems>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = searchableItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(kw => kw.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 sticky top-0 z-40">
      {/* Logo (mobile) */}
      <Link href="/" className="flex items-center gap-2 lg:hidden">
        <Leaf className="w-5 h-5 text-primary" />
        <span className="font-bold text-foreground">GreenIndex</span>
      </Link>

      {/* Campus Selector */}
      <div className="relative">
        <button
          onClick={() => { setShowCampus(!showCampus); setShowDate(false); setShowNotifs(false); setShowProfile(false); }}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:block">{campus}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {showCampus && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
            {campuses.map((c) => (
              <button
                key={c}
                onClick={() => { setCampus(c); setShowCampus(false); }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                  campus === c && "text-primary font-medium"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="relative">
        <button
          onClick={() => { setShowDate(!showDate); setShowCampus(false); setShowNotifs(false); setShowProfile(false); }}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:block">{dateRange}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {showDate && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
            {dateRanges.map((d) => (
              <button
                key={d}
                onClick={() => { setDateRange(d); setShowDate(false); }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                  dateRange === d && "text-primary font-medium"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search pages, metrics, alerts..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery && setShowSearchResults(true)}
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-secondary border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setShowSearchResults(false); }} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
            <div className="px-3 py-1.5 text-xs text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
            {searchResults.map((item, idx) => (
              <Link
                key={idx}
                href={item.url}
                onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
                className="flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.type}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
        {showSearchResults && searchResults.length === 0 && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg py-4 z-50 text-center">
            <div className="text-sm text-muted-foreground">No results found for "{searchQuery}"</div>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); setShowCampus(false); setShowDate(false); }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full pulse-dot" />
          </button>
          {showNotifs && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-card border border-border rounded-xl shadow-lg z-50">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-sm">Alerts</span>
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">3 new</span>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", n.severity === "high" ? "bg-red-500" : "bg-yellow-500")} />
                    <span className="text-sm font-medium">{n.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 ml-4">{n.time}</div>
                </div>
              ))}
              <div className="px-4 py-2.5">
                <Link href="/alerts" onClick={() => setShowNotifs(false)} className="text-xs text-primary hover:underline">
                  View all alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); setShowCampus(false); setShowDate(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium leading-none">Admin User</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Administrator</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showProfile && (
            <div className="absolute top-full right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-border">
                <div className="text-sm font-medium">Admin User</div>
                <div className="text-xs text-muted-foreground">admin@campus.edu</div>
              </div>
              {[
                { icon: User, label: "My Role", action: () => alert("Role: Administrator\nPermissions: Full access to all modules") },
                { icon: Settings, label: "Settings", action: () => window.location.href = "/admin" },
                { icon: LogOut, label: "Logout", action: () => { if (confirm("Are you sure you want to logout?")) alert("Logged out successfully"); } },
              ].map(({ icon: Icon, label, action }) => (
                <button 
                  key={label} 
                  onClick={() => { action(); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
