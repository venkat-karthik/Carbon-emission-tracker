import { NextRequest, NextResponse } from "next/server";
import { iotManager, ESP32SensorPacket } from "@/lib/iot-sensors";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const campusMetrics = iotManager.getTotalCampusMetrics();
        const allSensors = iotManager.getAllSensorsStatus();

        // We can also trigger the simulation engine on GET just to keep the "base" numbers moving 
        // in case the ESP32 isn't physically sending data right now.
        // However, real ESP32 data will override this via POST.

        return NextResponse.json({
            success: true,
            campusMetrics,
            allSensors
        });
    } catch (error) {
        console.error("[IoT API] Error fetching GET request:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const data: ESP32SensorPacket = await req.json();

        // Validate incoming data
        if (!data.deviceId || !data.timestamp || data.power === undefined) {
            return NextResponse.json(
                { success: false, message: "Invalid packet structure" },
                { status: 400 }
            );
        }

        // Process using iotManager (to get the real-time calculations like carbonRate)
        const reading = iotManager.processESP32Packet(data);

        // Save permanently to Supabase
        const { error: dbError } = await supabase
            .from("sensor_readings")
            .insert({
                device_id: data.deviceId,
                timestamp: new Date(data.timestamp * 1000).toISOString(),
                voltage: data.voltage,
                current: data.current,
                power: data.power,
                energy: data.energy,
                temperature: data.temperature,
                humidity: data.humidity,
                occupancy: data.occupancy,
                carbon_rate: reading.carbonRate,
            });

        if (dbError) {
            console.error("[Supabase Error] Failed to insert reading:", dbError.message);
            // We still return success: true because the device shouldn't stop sending if the DB drops a packet
        }

        console.log(`[IoT API] Processed & Saved reading from ${data.deviceId} - Power: ${data.power}W`);

        return NextResponse.json({ success: true, reading }, { status: 200 });
    } catch (error) {
        console.error("[IoT API] Error processing POST request:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
