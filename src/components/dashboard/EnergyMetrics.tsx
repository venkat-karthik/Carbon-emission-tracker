"use client";

import { useEffect, useState } from "react";
import { Zap, Leaf, IndianRupee, TrendingUp, Activity } from "lucide-react";
import { iotManager } from "@/lib/iot-sensors";
import { cn } from "@/lib/utils";

export default function EnergyMetrics() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Start real-time updates
    iotManager.startRealTimeUpdates(5000);

    const updateMetrics = () => {
      const campusMetrics = iotManager.getTotalCampusMetrics();
      setMetrics(campusMetrics);
    };

    // Initial update
    updateMetrics();

    // Subscribe to sensor updates
    const unsubscribe = iotManager.subscribe(() => {
      updateMetrics();
    });

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (!metrics) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      icon: Activity,
      label: "Real-Time Power",
      value: `${metrics.realTime.totalPowerKW.toFixed(2)} kW`,
      subValue: `${metrics.realTime.totalPowerW.toFixed(0)} W`,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      formula: "P = V × I",
    },
    {
      icon: Leaf,
      label: "Carbon Rate",
      value: `${metrics.realTime.carbonRateKgPerHr.toFixed(3)} kg/hr`,
      subValue: "CO₂ emissions",
      color: "text-green-500",
      bg: "bg-green-500/10",
      formula: "Rate = P(kW) × 0.82",
    },
    {
      icon: Zap,
      label: "Daily Energy",
      value: `${metrics.daily.energyKWh.toFixed(2)} kWh`,
      subValue: `${metrics.daily.carbonKg.toFixed(2)} kg CO₂`,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      formula: "E = (P × t) / 1000",
    },
    {
      icon: IndianRupee,
      label: "Daily Cost",
      value: `₹${metrics.daily.costINR.toFixed(2)}`,
      subValue: `₹${metrics.monthly.costINR.toFixed(0)}/month`,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      formula: "Cost = E × ₹8.50",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Live Energy Metrics</h3>
          <p className="text-xs text-muted-foreground">Real-time calculations using exact formulas</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", metric.bg)}>
                  <Icon className={cn("w-4.5 h-4.5", metric.color)} />
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-foreground">{metric.value}</div>
                  <div className="text-[10px] text-muted-foreground">{metric.subValue}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-foreground">{metric.label}</div>
                <div className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {metric.formula}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Projections */}
      <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Monthly Projections</h4>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Energy</div>
            <div className="text-lg font-bold text-foreground">{metrics.monthly.energyKWh.toFixed(0)} kWh</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Carbon</div>
            <div className="text-lg font-bold text-green-600">{metrics.monthly.carbonKg.toFixed(0)} kg</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Cost</div>
            <div className="text-lg font-bold text-orange-600">₹{metrics.monthly.costINR.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* Wastage Alerts */}
      {metrics.wastageAlerts > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs">
          <div className="font-semibold text-red-600 mb-1">⚠️ Wastage Detected</div>
          <div className="text-muted-foreground">
            {metrics.wastageAlerts} active wastage alert{metrics.wastageAlerts > 1 ? 's' : ''} detected. 
            Check alerts page for details.
          </div>
        </div>
      )}
    </div>
  );
}
