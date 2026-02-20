import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        // Fetch all active sensors
        const { data: sensors } = await supabase.from('sensors').select('*');

        // Fetch recent sensor readings (last 24 hours just for this demo)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: readings } = await supabase
            .from('sensor_readings')
            .select('*')
            .gte('timestamp', oneDayAgo)
            .order('timestamp', { ascending: true });

        // Fetch open alerts for Top Issues
        const { data: alerts } = await supabase
            .from('alerts')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(4);

        // Fetch latest alerts generally
        const { data: recentAlerts } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // -------------------------------------------------------------
        // Aggregate Data for Green Index Categories
        // Default base scores (if no data)
        let baseScores = {
            energy: { score: 70, trend: [65, 66, 68, 67, 69, 70, 70] },
            water: { score: 74, trend: [70, 72, 71, 75, 73, 76, 74] },
            waste: { score: 61, trend: [55, 58, 60, 59, 63, 62, 61] },
            transport: { score: 79, trend: [74, 76, 78, 77, 80, 79, 79] },
        };

        // If we have actual reading data (e.g. power readings from ESP32)
        // We calculate real energy trend.
        if (readings && readings.length > 0) {
            // Very simplified: sum power over time brackets to influence score
            // For now, let's just create a dynamic trend based on latest 7 readings
            const latestReadings = readings.slice(-7).map(r => r.power ? Math.max(0, 100 - (r.power / 10)) : 70);
            if (latestReadings.length > 0) {
                const currentEnergyScore = Math.round(latestReadings[latestReadings.length - 1]);
                baseScores.energy.score = currentEnergyScore;

                // Pad to 7 points if needed
                while (latestReadings.length < 7) {
                    latestReadings.unshift(latestReadings[0] || 70);
                }
                baseScores.energy.trend = latestReadings.map(Math.round);
            }
        }

        const categoryScores = [
            {
                id: "energy",
                label: "Energy",
                score: baseScores.energy.score,
                trend: baseScores.energy.trend,
                driver: "Live ESP32 Data Aggregation",
                change: +(baseScores.energy.score - baseScores.energy.trend[0]).toFixed(1),
            },
            {
                id: "water",
                label: "Water",
                score: baseScores.water.score,
                trend: baseScores.water.trend,
                driver: "Waiting for water sensors...",
                change: +1.8,
            },
            {
                id: "waste",
                label: "Waste",
                score: baseScores.waste.score,
                trend: baseScores.waste.trend,
                driver: "Segregation low in Hostel 2",
                change: -0.5,
            },
            {
                id: "transport",
                label: "Transport",
                score: baseScores.transport.score,
                trend: baseScores.transport.trend,
                driver: "High private vehicle share",
                change: +3.2,
            },
        ];

        // Calculate Overall Green Index Score
        const greenIndexScore = Math.round(
            (categoryScores[0].score * 0.4) +
            (categoryScores[1].score * 0.3) +
            (categoryScores[2].score * 0.15) +
            (categoryScores[3].score * 0.15)
        );

        // Format Top Issues
        const topIssues = (alerts || []).map(alert => ({
            id: alert.id,
            title: alert.message,
            category: alert.category,
            impact: alert.severity === 'critical' || alert.severity === 'high' ? -5 : -2,
            zone: alert.zone,
            severity: alert.severity,
            description: alert.cause || alert.message,
            suggestedFix: alert.suggested_action || "Automatic review required.",
            estimatedSavings: "₹2,000/month", // placeholder calculation
            co2Reduction: "0.2 tonnes/month", // placeholder
        }));

        // Format Latest Alerts
        const formattedLatestAlerts = (recentAlerts || []).map(alert => {
            // Rough time ago calculation
            const diffMs = Date.now() - new Date(alert.created_at).getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const timeStr = diffHours > 0 ? `${diffHours}h ago` : 'Just now';
            return {
                id: alert.id,
                time: timeStr,
                zone: alert.zone,
                type: alert.category,
                severity: alert.severity,
                message: alert.message
            };
        });

        return NextResponse.json({
            success: true,
            greenIndexScore,
            categoryScores,
            topIssues,
            latestAlerts: formattedLatestAlerts
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
