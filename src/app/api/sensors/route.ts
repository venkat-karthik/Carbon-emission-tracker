import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data: sensors } = await supabase.from('sensors').select('*').order('name');

        if (!sensors) {
            return NextResponse.json({ success: true, sensorsData: [] });
        }

        // For this demo, let's just format the sensors and attach some dummy or last known readings
        // A perfect implementation would join with the latest sensor_reading record for each sensor.

        const sensorsData = sensors.map(sensor => {
            let lastPing = "Unknown";
            let reading = "N/A";

            if (sensor.last_ping) {
                const diffMs = Date.now() - new Date(sensor.last_ping).getTime();
                const diffMins = Math.floor(diffMs / 60000);
                lastPing = diffMins > 0 ? `${diffMins} min ago` : 'Just now';
            } else if (sensor.status === 'active') {
                lastPing = "Recently";
            } else if (sensor.status === 'offline') {
                lastPing = "OFFLINE";
            }

            return {
                id: sensor.id,
                name: sensor.name,
                zone: sensor.zone,
                category: sensor.category,
                lastPing: lastPing,
                reading: reading, // Could be enhanced to fetch the actual last value
                health: sensor.status === 'active' ? 'Good' : (sensor.status === 'faulty' ? 'Faulty' : 'Warning')
            };
        });

        return NextResponse.json({
            success: true,
            sensorsData
        });

    } catch (error) {
        console.error("Sensors API Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
