import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data: alerts } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });

        if (!alerts) {
            return NextResponse.json({ success: true, alertsData: [] });
        }

        const alertsData = alerts.map(alert => {
            const date = new Date(alert.created_at);
            return {
                id: alert.id,
                time: date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
                zone: alert.zone,
                type: alert.category,
                severity: alert.severity,
                cause: alert.cause || alert.message,
                status: alert.status === 'open' ? 'Open' : (alert.status === 'in_progress' ? 'In Progress' : 'Closed'),
                rule: alert.rule_triggered || 'Anomaly Threshold',
                evidence: alert.evidence || 'N/A',
                action: alert.suggested_action || 'Review needed'
            };
        });

        return NextResponse.json({
            success: true,
            alertsData
        });

    } catch (error) {
        console.error("Alerts API Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
