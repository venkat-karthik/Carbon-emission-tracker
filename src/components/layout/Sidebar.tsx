"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  FlaskConical,
  Trophy,
  Bell,
  Database,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Zap,
  Droplets,
  Recycle,
  Bus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { iotManager } from "@/lib/iot-sensors";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/simulator", label: "What-If Simulator", icon: FlaskConical },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: 3 },
  { href: "/data-input", label: "Data Input", icon: Database },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/admin", label: "Admin Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [liveScores, setLiveScores] = useState({
    Energy: 68,
    Water: 74,
    Waste: 61,
    Transport: 79,
  });

  // Update live scores from IoT sensors
  useEffect(() => {
    iotManager.startRealTimeUpdates(5000);

    const updateScores = () => {
      setLiveScores({
        Energy: iotManager.getCategoryScore('energy'),
        Water: iotManager.getCategoryScore('water'),
        Waste: iotManager.getCategoryScore('waste'),
        Transport: iotManager.getCategoryScore('transport'),
      });
    };

    // Initial update
    updateScores();

    // Subscribe to sensor updates
    const unsubscribe = iotManager.subscribe(() => {
      updateScores();
    });

    // Update every 10 seconds
    const interval = setInterval(updateScores, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      iotManager.stopRealTimeUpdates();
    };
  }, []);

  const miniMetrics = [
    { icon: Zap, value: liveScores.Energy.toString(), label: "Energy", color: "text-yellow-400" },
    { icon: Droplets, value: liveScores.Water.toString(), label: "Water", color: "text-blue-400" },
    { icon: Recycle, value: liveScores.Waste.toString(), label: "Waste", color: "text-green-400" },
    { icon: Bus, value: liveScores.Transport.toString(), label: "Transport", color: "text-orange-400" },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border", collapsed && "justify-center px-2")}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/20 flex-shrink-0">
          <Leaf className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sidebar-foreground font-bold text-lg leading-none">GreenIndex</span>
            <div className="text-xs text-sidebar-foreground/40 mt-0.5">Campus OS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-sidebar-foreground/90 text-sidebar text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mini metrics */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-1">
          <div className="text-xs text-sidebar-foreground/40 px-2 py-1 uppercase tracking-wider">Live Scores</div>
          <div className="grid grid-cols-2 gap-1.5">
            {miniMetrics.map((m) => {
              const Icon = m.icon;
              const categoryMap: Record<string, string> = {
                Energy: "energy",
                Water: "water",
                Waste: "waste",
                Transport: "transport"
              };
              return (
                <Link
                  key={m.label}
                  href={`/analytics?category=${categoryMap[m.label]}`}
                  className="bg-sidebar-accent rounded-lg px-2 py-2 flex items-center gap-1.5 hover:bg-sidebar-accent/80 transition-colors cursor-pointer"
                >
                  <Icon className={cn("w-3.5 h-3.5", m.color)} />
                  <div>
                    <div className="text-sidebar-foreground text-xs font-bold">{m.value}</div>
                    <div className="text-sidebar-foreground/40 text-[10px]">{m.label}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
