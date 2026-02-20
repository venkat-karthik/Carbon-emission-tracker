// Mock data for GreenIndex Campus Sustainability OS

export const campuses = [
  "Main Campus",
  "Hostel Zone",
  "Block A",
  "Block B",
  "CSE Dept",
  "Mechanical Dept",
  "Library Block",
];

export const dateRanges = ["Today", "Last 7 days", "Last 30 days", "Custom"];

export const greenIndexScore = 73;

export const categoryScores = [
  {
    id: "energy",
    label: "Energy",
    score: 68,
    trend: [62, 65, 67, 64, 70, 68, 68],
    driver: "Peak-hour usage high",
    color: "oklch(0.78 0.2 80)",
    icon: "Zap",
    change: +2.1,
  },
  {
    id: "water",
    label: "Water",
    score: 74,
    trend: [70, 72, 71, 75, 73, 76, 74],
    driver: "Leaks suspected in Zone B",
    color: "oklch(0.62 0.18 220)",
    icon: "Droplets",
    change: +1.8,
  },
  {
    id: "waste",
    label: "Waste",
    score: 61,
    trend: [55, 58, 60, 59, 63, 62, 61],
    driver: "Segregation low in Hostel 2",
    color: "oklch(0.58 0.16 140)",
    icon: "Recycle",
    change: -0.5,
  },
  {
    id: "transport",
    label: "Transport",
    score: 79,
    trend: [74, 76, 78, 77, 80, 79, 79],
    driver: "High private vehicle share",
    color: "oklch(0.65 0.22 30)",
    icon: "Bus",
    change: +3.2,
  },
];

export const topIssues = [
  {
    id: 1,
    title: "Block B peak usage +18%",
    category: "Energy",
    impact: -6,
    zone: "Block B",
    severity: "high",
    description: "Average peak-hour consumption exceeds baseline by 18%. AC units running unmonitored after 9 PM.",
    suggestedFix: "Implement auto-off policy for ACs after 10 PM. Install occupancy sensors.",
    estimatedSavings: "₹12,400/month",
    co2Reduction: "0.8 tonnes/month",
  },
  {
    id: 2,
    title: "Waste segregation missing – Hostel 2",
    category: "Waste",
    impact: -4,
    zone: "Hostel Zone",
    severity: "high",
    description: "Dry/wet waste bins not separated for 3 consecutive weeks. Recycling rate dropped to 12%.",
    suggestedFix: "Deploy color-coded bins. Schedule awareness session. Appoint floor waste monitors.",
    estimatedSavings: "₹3,200/month",
    co2Reduction: "0.3 tonnes/month",
  },
  {
    id: 3,
    title: "Water leak suspected – Lab Block",
    category: "Water",
    impact: -3,
    zone: "Block A",
    severity: "medium",
    description: "Overnight consumption 2.4x daytime average. Likely pipe leakage or open tap.",
    suggestedFix: "Manual inspection of plumbing. Install flow sensor. Meter audit.",
    estimatedSavings: "₹5,100/month",
    co2Reduction: "0.1 tonnes/month",
  },
  {
    id: 4,
    title: "Standby load – CSE Lab",
    category: "Energy",
    impact: -2,
    zone: "CSE Dept",
    severity: "low",
    description: "15 desktop systems left on overnight. 0.3 kWh per system per night.",
    suggestedFix: "Enable auto-sleep policy. Print reminder posters. IT policy update.",
    estimatedSavings: "₹2,800/month",
    co2Reduction: "0.15 tonnes/month",
  },
];

export const latestAlerts = [
  { id: 1, time: "2h ago", zone: "Block B", type: "Energy", severity: "high", message: "Consumption spike: 3.2x baseline" },
  { id: 2, time: "4h ago", zone: "Hostel Zone", type: "Waste", severity: "high", message: "Segregation compliance dropped below 20%" },
  { id: 3, time: "6h ago", zone: "Block A", type: "Water", severity: "medium", message: "Overnight flow anomaly detected" },
  { id: 4, time: "1d ago", zone: "CSE Dept", type: "Energy", severity: "low", message: "Standby consumption after hours" },
  { id: 5, time: "1d ago", zone: "Library", type: "Energy", severity: "low", message: "AC running with no occupancy" },
];

export const greenIndexTrend = [
  { date: "Feb 13", score: 68, energy: 62, water: 71, waste: 58, transport: 74 },
  { date: "Feb 14", score: 70, energy: 65, water: 72, waste: 60, transport: 75 },
  { date: "Feb 15", score: 69, energy: 63, water: 70, waste: 61, transport: 76 },
  { date: "Feb 16", score: 71, energy: 66, water: 73, waste: 62, transport: 77 },
  { date: "Feb 17", score: 72, energy: 67, water: 74, waste: 60, transport: 78 },
  { date: "Feb 18", score: 73, energy: 68, water: 75, waste: 61, transport: 79 },
  { date: "Feb 19", score: 73, energy: 68, water: 74, waste: 61, transport: 79 },
];

export const peakHeatmapData = [
  { hour: "12am", Mon: 0.4, Tue: 0.3, Wed: 0.5, Thu: 0.4, Fri: 0.6, Sat: 0.2, Sun: 0.1 },
  { hour: "2am",  Mon: 0.3, Tue: 0.3, Wed: 0.3, Thu: 0.3, Fri: 0.4, Sat: 0.2, Sun: 0.1 },
  { hour: "4am",  Mon: 0.3, Tue: 0.2, Wed: 0.3, Thu: 0.2, Fri: 0.3, Sat: 0.1, Sun: 0.1 },
  { hour: "6am",  Mon: 0.8, Tue: 0.7, Wed: 0.9, Thu: 0.8, Fri: 0.9, Sat: 0.5, Sun: 0.3 },
  { hour: "8am",  Mon: 2.1, Tue: 2.3, Wed: 2.4, Thu: 2.2, Fri: 2.5, Sat: 1.1, Sun: 0.6 },
  { hour: "10am", Mon: 3.4, Tue: 3.6, Wed: 3.5, Thu: 3.8, Fri: 3.9, Sat: 1.4, Sun: 0.8 },
  { hour: "12pm", Mon: 3.8, Tue: 4.1, Wed: 3.9, Thu: 4.0, Fri: 4.2, Sat: 1.6, Sun: 0.9 },
  { hour: "2pm",  Mon: 4.2, Tue: 4.5, Wed: 4.3, Thu: 4.6, Fri: 4.8, Sat: 1.5, Sun: 0.7 },
  { hour: "4pm",  Mon: 4.0, Tue: 4.2, Wed: 4.1, Thu: 4.3, Fri: 4.5, Sat: 1.3, Sun: 0.6 },
  { hour: "6pm",  Mon: 2.8, Tue: 2.9, Wed: 2.7, Thu: 3.0, Fri: 3.2, Sat: 1.8, Sun: 1.2 },
  { hour: "8pm",  Mon: 2.1, Tue: 2.2, Wed: 2.0, Thu: 2.3, Fri: 2.8, Sat: 2.1, Sun: 1.5 },
  { hour: "10pm", Mon: 1.4, Tue: 1.3, Wed: 1.5, Thu: 1.6, Fri: 2.1, Sat: 1.9, Sun: 1.1 },
];

export const penaltiesCredits = [
  { name: "Peak Usage", type: "penalty", value: -8.2, category: "Energy" },
  { name: "Standby Load", type: "penalty", value: -3.1, category: "Energy" },
  { name: "Water Leakage", type: "penalty", value: -4.5, category: "Water" },
  { name: "Waste Non-Segregation", type: "penalty", value: -5.8, category: "Waste" },
  { name: "Private Vehicles", type: "penalty", value: -2.4, category: "Transport" },
  { name: "Solar Generation", type: "credit", value: 6.2, category: "Energy" },
  { name: "Recycling", type: "credit", value: 3.8, category: "Waste" },
  { name: "Rainwater Harvest", type: "credit", value: 2.1, category: "Water" },
  { name: "EV Charging", type: "credit", value: 1.9, category: "Transport" },
];

export const analyticsInsights = [
  {
    id: 1,
    title: "After-hours consumption high",
    category: "Energy",
    severity: "high",
    evidence: "12am–5am average 2.1 kWh; baseline 0.6 kWh",
    impact: "-3.2 points",
    action: "Auto-off policy / check standby loads",
  },
  {
    id: 2,
    title: "Waste segregation compliance dropping",
    category: "Waste",
    severity: "high",
    evidence: "Hostel 2: 18% segregation rate this week vs 42% last week",
    impact: "-2.8 points",
    action: "Re-deploy bins and host awareness session",
  },
  {
    id: 3,
    title: "Solar underperforming vs forecast",
    category: "Energy",
    severity: "medium",
    evidence: "Solar output 68% of estimated; panels may need cleaning",
    impact: "-1.4 points",
    action: "Schedule panel cleaning and inspect inverter",
  },
  {
    id: 4,
    title: "EV adoption improving",
    category: "Transport",
    severity: "positive",
    evidence: "EV parking slots usage up 34% vs last month",
    impact: "+1.9 points",
    action: "Consider adding 4 more charging ports",
  },
];

export const leaderboardData = {
  departments: [
    { rank: 1, name: "Computer Science", score: 84, change: +3.2, badge: "Most Improved", trend: "up" },
    { rank: 2, name: "Library & Admin", score: 81, change: +1.1, badge: "Power Saver", trend: "up" },
    { rank: 3, name: "Mechanical Dept", score: 77, change: -0.8, badge: null, trend: "down" },
    { rank: 4, name: "Electronics Dept", score: 75, change: +2.4, badge: null, trend: "up" },
    { rank: 5, name: "Civil Dept", score: 72, change: +0.6, badge: "Water Guardian", trend: "up" },
    { rank: 6, name: "Chemistry Lab", score: 69, change: -1.2, badge: null, trend: "down" },
    { rank: 7, name: "Physics Lab", score: 66, change: +0.3, badge: null, trend: "up" },
    { rank: 8, name: "Management Block", score: 62, change: -2.1, badge: null, trend: "down" },
  ],
  hostels: [
    { rank: 1, name: "Boys Hostel A", score: 82, change: +4.1, badge: "Waste Champion", trend: "up" },
    { rank: 2, name: "Girls Hostel B", score: 79, change: +1.8, badge: null, trend: "up" },
    { rank: 3, name: "Boys Hostel B", score: 71, change: -1.5, badge: null, trend: "down" },
    { rank: 4, name: "Girls Hostel A", score: 68, change: +0.9, badge: null, trend: "up" },
    { rank: 5, name: "Faculty Quarters", score: 65, change: +2.2, badge: null, trend: "up" },
  ],
  blocks: [
    { rank: 1, name: "Block A (CSE)", score: 84, change: +2.8, badge: "Most Improved", trend: "up" },
    { rank: 2, name: "Block C (Library)", score: 80, change: +1.4, badge: null, trend: "up" },
    { rank: 3, name: "Main Block", score: 76, change: -0.6, badge: null, trend: "down" },
    { rank: 4, name: "Block B (Mech)", score: 64, change: -3.2, badge: null, trend: "down" },
    { rank: 5, name: "Lab Complex", score: 61, change: +1.1, badge: null, trend: "up" },
  ],
};

export const alertsData = [
  {
    id: 1,
    time: "Feb 19, 10:32 AM",
    zone: "Block B",
    type: "Energy",
    severity: "high",
    cause: "Peak-hour consumption 3.2x baseline",
    status: "Open",
    rule: "Spike threshold >2.5x baseline",
    evidence: "Power draw: 4.8kWh at 2PM vs baseline 1.5kWh",
    action: "Inspect AC units and non-essential equipment",
  },
  {
    id: 2,
    time: "Feb 19, 08:15 AM",
    zone: "Hostel Zone",
    type: "Waste",
    severity: "high",
    cause: "Segregation rate < 20%",
    status: "In Progress",
    rule: "Waste compliance below 25%",
    evidence: "Mixed waste in 8 of 10 bins sampled",
    action: "Assign warden for bin audit",
  },
  {
    id: 3,
    time: "Feb 18, 11:45 PM",
    zone: "Block A",
    type: "Water",
    severity: "medium",
    cause: "Overnight flow anomaly",
    status: "Open",
    rule: "Overnight flow > 1.5x daytime avg",
    evidence: "Flow: 2.4L/min at midnight vs 1.0L/min baseline",
    action: "Inspect pipe fittings in Lab A corridor",
  },
  {
    id: 4,
    time: "Feb 18, 09:20 PM",
    zone: "CSE Dept",
    type: "Energy",
    severity: "low",
    cause: "Standby consumption after hours",
    status: "Closed",
    rule: "After-hours load > 0.5kWh",
    evidence: "15 systems left on, 0.3kWh each",
    action: "IT issued auto-sleep policy",
  },
  {
    id: 5,
    time: "Feb 18, 04:10 PM",
    zone: "Library",
    type: "Energy",
    severity: "low",
    cause: "AC running, no occupancy",
    status: "Closed",
    rule: "Occupancy sensor: empty for >2h",
    evidence: "HVAC on for 140 min with 0 occupants",
    action: "Occupancy-based AC timer installed",
  },
];

export const sensorsData = [
  { id: "S001", name: "Block B Main Meter", zone: "Block B", category: "Energy", lastPing: "2 min ago", reading: "4.8 kWh", health: "Good" },
  { id: "S002", name: "Hostel Zone Water", zone: "Hostel Zone", category: "Water", lastPing: "5 min ago", reading: "12.3 L/min", health: "Good" },
  { id: "S003", name: "Lab Block Flow", zone: "Block A", category: "Water", lastPing: "18 min ago", reading: "2.4 L/min", health: "Warning" },
  { id: "S004", name: "Solar Inverter 1", zone: "Main Campus", category: "Energy", lastPing: "1 min ago", reading: "18.2 kW", health: "Good" },
  { id: "S005", name: "Waste Bin Scale A", zone: "Hostel Zone", category: "Waste", lastPing: "1h ago", reading: "48 kg", health: "Good" },
  { id: "S006", name: "EV Charger Bay", zone: "Main Campus", category: "Transport", lastPing: "8 min ago", reading: "6 active", health: "Good" },
  { id: "S007", name: "CSE Dept Panel", zone: "CSE Dept", category: "Energy", lastPing: "3 min ago", reading: "1.2 kWh", health: "Good" },
  { id: "S008", name: "Canteen Water", zone: "Main Campus", category: "Water", lastPing: "OFFLINE", reading: "N/A", health: "Faulty" },
];
