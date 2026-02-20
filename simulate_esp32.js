// simulate_esp32.js
const API_URL = "http://localhost:3000/api/iot";

const generateDummyData = () => {
    return {
        deviceId: "LAB1_NODE1",
        timestamp: Math.floor(Date.now() / 1000),
        voltage: +(220 + Math.random() * 10).toFixed(1),
        current: +(1.5 + Math.random() * 0.5).toFixed(2),
        power: +(330 + Math.random() * 100).toFixed(1),
        energy: +(2.8 + Math.random() * 0.1).toFixed(3),
        temperature: +(25 + Math.random() * 5).toFixed(1),
        humidity: +(50 + Math.random() * 20).toFixed(1),
        occupancy: Math.random() > 0.5 ? 1 : 0
    };
};

const sendData = async () => {
    const data = generateDummyData();
    console.log(`Sending data to ${API_URL}:`, data);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // Note: Node 18+ includes native fetch. If using older Node, cross-fetch might be required. 
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log("Response:", result);
    } catch (error) {
        console.error("Error sending data. Is the server running? Error:", error.message);
    }
};

console.log("=========================================");
console.log("Starting ESP32 simulation...");
console.log("=========================================");

// Send initial data then setup interval
sendData();
setInterval(sendData, 5000);
