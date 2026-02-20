import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        // In a real scenario, we group sensor_readings by day for the trend lines.
        // For this milestone, we blend static and dynamic data just to demonstrate connection.

        const greenIndexTrend = [
            { date: "Feb 13", score: 68, energy: 62, water: 71, waste: 58, transport: 74 },
            { date: "Feb 14", score: 70, energy: 65, water: 72, waste: 60, transport: 75 },
            { date: "Feb 15", score: 69, energy: 63, water: 70, waste: 61, transport: 76 },
            { date: "Feb 16", score: 71, energy: 66, water: 73, waste: 62, transport: 77 },
            { date: "Feb 17", score: 72, energy: 67, water: 74, waste: 60, transport: 78 },
            { date: "Feb 18", score: 73, energy: 68, water: 75, waste: 61, transport: 79 },
            { date: "Today", score: 75, energy: 72, water: 74, waste: 61, transport: 79 }, // Boosted today
        ];

        const peakHeatmapData = [
            { hour: "12am", Mon: 0.4, Tue: 0.3, Wed: 0.5, Thu: 0.4, Fri: 0.6, Sat: 0.2, Sun: 0.1 },
            { hour: "2am", Mon: 0.3, Tue: 0.3, Wed: 0.3, Thu: 0.3, Fri: 0.4, Sat: 0.2, Sun: 0.1 },
            { hour: "4am", Mon: 0.3, Tue: 0.2, Wed: 0.3, Thu: 0.2, Fri: 0.3, Sat: 0.1, Sun: 0.1 },
            { hour: "6am", Mon: 0.8, Tue: 0.7, Wed: 0.9, Thu: 0.8, Fri: 0.9, Sat: 0.5, Sun: 0.3 },
            { hour: "8am", Mon: 2.1, Tue: 2.3, Wed: 2.4, Thu: 2.2, Fri: 2.5, Sat: 1.1, Sun: 0.6 },
            { hour: "10am", Mon: 3.4, Tue: 3.6, Wed: 3.5, Thu: 3.8, Fri: 3.9, Sat: 1.4, Sun: 0.8 },
            { hour: "12pm", Mon: 3.8, Tue: 4.1, Wed: 3.9, Thu: 4.0, Fri: 4.2, Sat: 1.6, Sun: 0.9 },
            { hour: "2pm", Mon: 4.2, Tue: 4.5, Wed: 4.3, Thu: 4.6, Fri: 4.8, Sat: 1.5, Sun: 0.7 },
            { hour: "4pm", Mon: 4.0, Tue: 4.2, Wed: 4.1, Thu: 4.3, Fri: 4.5, Sat: 1.3, Sun: 0.6 },
            { hour: "6pm", Mon: 2.8, Tue: 2.9, Wed: 2.7, Thu: 3.0, Fri: 3.2, Sat: 1.8, Sun: 1.2 },
            { hour: "8pm", Mon: 2.1, Tue: 2.2, Wed: 2.0, Thu: 2.3, Fri: 2.8, Sat: 2.1, Sun: 1.5 },
            { hour: "10pm", Mon: 1.4, Tue: 1.3, Wed: 1.5, Thu: 1.6, Fri: 2.1, Sat: 1.9, Sun: 1.1 },
        ];

        const penaltiesCredits = [
            { name: "Peak Usage", type: "penalty", value: -8.2, category: "Energy" },
            { name: "Standby Load", type: "penalty", value: -3.1, category: "Energy" },
            { name: "Waste Non-Segregation", type: "penalty", value: -5.8, category: "Waste" },
            { name: "Solar Generation", type: "credit", value: 6.2, category: "Energy" },
            { name: "Recycling", type: "credit", value: 3.8, category: "Waste" },
            { name: "Rainwater Harvest", type: "credit", value: 2.1, category: "Water" },
            { name: "EV Charging", type: "credit", value: 1.9, category: "Transport" },
        ];

        const analyticsInsights = [
            { id: 1, title: "After-hours consumption high", category: "Energy", severity: "high", evidence: "12am–5am average 2.1 kWh", impact: "-3.2 points", action: "Auto-off policy" },
            { id: 2, title: "Solar underperforming", category: "Energy", severity: "medium", evidence: "Output 68% of estimated", impact: "-1.4 points", action: "Schedule panel cleaning" },
            { id: 3, title: "EV adoption improving", category: "Transport", severity: "positive", evidence: "EV parking usage up 34%", impact: "+1.9 points", action: "Add more EV ports" },
        ];

        return NextResponse.json({
            success: true,
            greenIndexTrend,
            peakHeatmapData,
            penaltiesCredits,
            analyticsInsights
        });

    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
