import mqtt from 'mqtt';
import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Configuration options
const MQTT_BROKER_URL = 'mqtt://localhost:1883'; // Change if broker is on another machine
const MQTT_TOPIC = 'greenindex/sensors/#'; // Listen to all sensor topics
const NEXTJS_API_URL = 'http://localhost:3000/api/iot'; // Our existing endpoint

console.log('=========================================');
console.log(`Starting MQTT to HTTP Bridge`);
console.log(`Broker: ${MQTT_BROKER_URL}`);
console.log(`Topic:  ${MQTT_TOPIC}`);
console.log(`Target API: ${NEXTJS_API_URL}`);
console.log('=========================================\n');

// Connect to the MQTT Broker
const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `greenindex_bridge_${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log('[MQTT] Connected to broker successfully!');

    // Subscribe to the topic
    client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
            console.log(`[MQTT] Subscribed to topic: ${MQTT_TOPIC}`);
        } else {
            console.error('[MQTT] Failed to subscribe:', err);
        }
    });
});

client.on('error', (err) => {
    console.error('[MQTT] Connection error:', err);
});

// Listen for incoming messages
client.on('message', async (topic, message) => {
    console.log(`\n[MQTT] Received message on topic: ${topic}`);

    try {
        // Assume the payload is JSON matching our ESP32SensorPacket interface
        const payloadStr = message.toString();
        const data = JSON.parse(payloadStr);

        console.log('[Bridge] Parsed payload:', data);
        console.log(`[Bridge] Forwarding to ${NEXTJS_API_URL}...`);

        // Forward the data to the Next.js API
        const response = await fetch(NEXTJS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('[Bridge] Successfully forwarded. API Response:', result);
        } else {
            console.error('[Bridge] API rejected payload. Status:', response.status, result);
        }

    } catch (e) {
        console.error('[Bridge] Error processing message. Is it valid JSON?', e.message);
    }
});
