# ESP32 Hardware Integration Guide

## 🔌 Hardware Components

### Required Components:
- ☐ **ESP32** Development Board
- ☐ **PZEM-004T** Energy Monitoring Sensor
- ☐ **PIR** Motion Sensor (HC-SR501)
- ☐ **DHT11** Temperature & Humidity Sensor
- ☐ **Jumper Wires** (Male-to-Male, Male-to-Female)
- ☐ **Breadboard** (optional, for prototyping)
- ☐ **5V Power Supply** for PZEM-004T

---

## 📊 Exact Data from Each Sensor

### 🔹 From PZEM-004T (Energy Sensor)

ESP32 reads these values:

| Parameter | Meaning | Example |
|-----------|---------|---------|
| `voltage` | AC voltage | 228.4 V |
| `current` | Current in amps | 1.52 A |
| `power` | Instant power (W) | 345.6 W |
| `energy` | Total energy (kWh) | 0.127 kWh |

**So from PZEM you get**: `voltage`, `current`, `power`, `energy`

---

### 🔹 From PIR (Motion Sensor)

ESP32 reads:

| Value | Meaning |
|-------|---------|
| `occupancy = 1` | Motion detected (room occupied) |
| `occupancy = 0` | No motion (room empty) |

**So from PIR you get**: `occupancy`

---

### 🔹 From DHT11 (Temp Sensor)

ESP32 reads:

| Value | Meaning | Example |
|-------|---------|---------|
| `temperature` | Room temperature (°C) | 29°C |
| `humidity` | Relative humidity (%) | 62% |

**So from DHT11 you get**: `temperature`, `humidity`

---

## 📦 Final Data Packet

### What ESP32 Sends to Backend:

```json
{
  "deviceId": "ROOM1",
  "timestamp": 1700000000,
  "voltage": 228.4,
  "current": 1.52,
  "power": 345.6,
  "energy": 0.127,
  "temperature": 29,
  "humidity": 62,
  "occupancy": 1
}
```

**This is the exact structure your backend receives via MQTT or HTTP!**

---

## 🔧 Wiring Diagram

### ESP32 Pin Connections:

```
ESP32          PZEM-004T
GPIO16 (RX2) → TX
GPIO17 (TX2) → RX
5V           → VCC
GND          → GND

ESP32          PIR Sensor
GPIO18       → OUT
5V           → VCC
GND          → GND

ESP32          DHT11
GPIO19       → DATA
3.3V         → VCC
GND          → GND
```

### Visual Diagram:

```
                    ┌─────────────┐
                    │   ESP32     │
                    │             │
    ┌───────────────┤ GPIO16 (RX2)│
    │               │ GPIO17 (TX2)│───────────┐
    │               │ GPIO18      │─────┐     │
    │               │ GPIO19      │──┐  │     │
    │               │ 5V          │──│──│──┐  │
    │               │ 3.3V        │──│──│──│──│──┐
    │               │ GND         │──│──│──│──│──│──┐
    │               └─────────────┘  │  │  │  │  │  │
    │                                │  │  │  │  │  │
    │  ┌─────────────────────────────┘  │  │  │  │  │
    │  │  ┌────────────────────────────┘  │  │  │  │
    │  │  │  ┌─────────────────────────────┘  │  │  │
    │  │  │  │  ┌──────────────────────────────┘  │  │
    │  │  │  │  │  ┌───────────────────────────────┘  │
    │  │  │  │  │  │  ┌────────────────────────────────┘
    ▼  ▼  ▼  ▼  ▼  ▼  ▼
┌────────────┐  ┌────────┐  ┌────────┐
│ PZEM-004T  │  │  PIR   │  │ DHT11  │
│            │  │        │  │        │
│ TX  RX     │  │  OUT   │  │ DATA   │
│ VCC GND    │  │ VCC GND│  │VCC GND │
└────────────┘  └────────┘  └────────┘
```

---

## 💻 ESP32 Arduino Code

### Complete Implementation:

```cpp
/*
 * GreenIndex Campus - ESP32 Sensor Node
 * Sensors: PZEM-004T + PIR + DHT11
 * Communication: MQTT
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <time.h>

// ============================================================================
// CONFIGURATION - CHANGE THESE VALUES
// ============================================================================

// WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT broker
const char* MQTT_SERVER = "your-broker.com";  // or IP: "192.168.1.100"
const int MQTT_PORT = 1883;
const char* MQTT_USER = "your-username";
const char* MQTT_PASSWORD = "your-password";

// Device configuration
const char* DEVICE_ID = "ROOM1";  // Change for each room
const char* MQTT_TOPIC = "campus/sensors/ROOM1";

// Pin definitions
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17
#define PIR_PIN 18
#define DHT_PIN 19
#define DHT_TYPE DHT11

// Reading interval (milliseconds)
#define READING_INTERVAL 5000  // 5 seconds

// ============================================================================
// GLOBAL OBJECTS
// ============================================================================

PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);
DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// NTP server for time synchronization
const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SEC = 19800;  // IST = UTC+5:30 = 19800 seconds
const int DAYLIGHT_OFFSET_SEC = 0;

// ============================================================================
// SETUP
// ============================================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=================================");
  Serial.println("GreenIndex ESP32 Sensor Node");
  Serial.println("Device ID: " + String(DEVICE_ID));
  Serial.println("=================================\n");
  
  // Initialize PIR sensor
  pinMode(PIR_PIN, INPUT);
  Serial.println("✓ PIR sensor initialized");
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("✓ DHT11 sensor initialized");
  
  // Initialize PZEM sensor
  Serial.println("✓ PZEM-004T initialized");
  
  // Connect to WiFi
  connectWiFi();
  
  // Sync time with NTP
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  Serial.println("✓ Time synchronized with NTP");
  
  // Connect to MQTT
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  connectMQTT();
  
  Serial.println("\n✓ Setup complete! Starting sensor readings...\n");
}

// ============================================================================
// MAIN LOOP
// ============================================================================

void loop() {
  // Maintain MQTT connection
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();
  
  // Read sensors at specified interval
  static unsigned long lastRead = 0;
  if (millis() - lastRead >= READING_INTERVAL) {
    lastRead = millis();
    readAndPublishSensors();
  }
}

// ============================================================================
// SENSOR READING & PUBLISHING
// ============================================================================

void readAndPublishSensors() {
  Serial.println("─────────────────────────────────");
  Serial.println("Reading sensors...");
  
  // Read PZEM-004T
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power = pzem.power();
  float energy = pzem.energy();
  
  // Read PIR
  int occupancy = digitalRead(PIR_PIN);
  
  // Read DHT11
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Validate readings
  if (isnan(voltage) || voltage < 0) {
    Serial.println("⚠ PZEM read error - using defaults");
    voltage = 230.0;
    current = 0.0;
    power = 0.0;
    energy = 0.0;
  }
  
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("⚠ DHT read error - using defaults");
    temperature = 25.0;
    humidity = 50.0;
  }
  
  // Get current timestamp
  time_t now;
  time(&now);
  
  // Print readings
  Serial.println("\nSensor Readings:");
  Serial.println("  PZEM-004T:");
  Serial.printf("    Voltage: %.2f V\n", voltage);
  Serial.printf("    Current: %.2f A\n", current);
  Serial.printf("    Power: %.2f W\n", power);
  Serial.printf("    Energy: %.3f kWh\n", energy);
  Serial.println("  PIR:");
  Serial.printf("    Occupancy: %d (%s)\n", occupancy, occupancy ? "Occupied" : "Empty");
  Serial.println("  DHT11:");
  Serial.printf("    Temperature: %.1f °C\n", temperature);
  Serial.printf("    Humidity: %.1f %%\n", humidity);
  
  // Create JSON packet
  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["timestamp"] = now;
  doc["voltage"] = round(voltage * 10) / 10.0;
  doc["current"] = round(current * 100) / 100.0;
  doc["power"] = round(power * 10) / 10.0;
  doc["energy"] = round(energy * 1000) / 1000.0;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["occupancy"] = occupancy;
  
  // Serialize to string
  char buffer[256];
  serializeJson(doc, buffer);
  
  Serial.println("\nJSON Packet:");
  Serial.println(buffer);
  
  // Publish to MQTT
  if (mqttClient.publish(MQTT_TOPIC, buffer)) {
    Serial.println("\n✓ Published to MQTT successfully");
  } else {
    Serial.println("\n✗ MQTT publish failed");
  }
  
  Serial.println("─────────────────────────────────\n");
}

// ============================================================================
// WIFI CONNECTION
// ============================================================================

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected");
    Serial.print("  IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi connection failed");
    Serial.println("  Restarting in 5 seconds...");
    delay(5000);
    ESP.restart();
  }
}

// ============================================================================
// MQTT CONNECTION
// ============================================================================

void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT broker...");
    
    if (mqttClient.connect(DEVICE_ID, MQTT_USER, MQTT_PASSWORD)) {
      Serial.println(" ✓ connected");
      
      // Publish online status
      String statusTopic = String("campus/sensors/") + DEVICE_ID + "/status";
      mqttClient.publish(statusTopic.c_str(), "online");
      
    } else {
      Serial.print(" ✗ failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" - retrying in 5 seconds");
      delay(5000);
    }
  }
}
```

---

## 📚 Required Arduino Libraries

Install these libraries via Arduino IDE Library Manager:

1. **WiFi** (built-in with ESP32)
2. **PubSubClient** by Nick O'Leary
3. **PZEM-004Tv30** by Jakub Mandula
4. **DHT sensor library** by Adafruit
5. **ArduinoJson** by Benoit Blanchon

### Installation Steps:

1. Open Arduino IDE
2. Go to **Sketch → Include Library → Manage Libraries**
3. Search for each library and click **Install**

---

## 🌐 Backend Integration

### Option 1: MQTT (Recommended)

```typescript
// Node.js backend with MQTT
import mqtt from 'mqtt';
import { iotManager, ESP32SensorPacket } from './lib/iot-sensors';

const client = mqtt.connect('mqtt://your-broker.com:1883');

client.on('connect', () => {
  client.subscribe('campus/sensors/+');
});

client.on('message', (topic, message) => {
  const packet: ESP32SensorPacket = JSON.parse(message.toString());
  const reading = iotManager.processESP32Packet(packet);
  
  // Store in database, trigger alerts, etc.
  console.log('Processed:', reading);
});
```

### Option 2: HTTP POST (Alternative)

```cpp
// ESP32 sends HTTP POST instead of MQTT
#include <HTTPClient.h>

void sendHTTP() {
  HTTPClient http;
  http.begin("http://your-server.com/api/sensors/reading");
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(buffer);
  
  if (httpCode == 200) {
    Serial.println("✓ HTTP POST successful");
  }
  
  http.end();
}
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE sensor_readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  
  -- PZEM-004T
  voltage DECIMAL(6,2),
  current DECIMAL(6,2),
  power DECIMAL(8,2),
  energy DECIMAL(10,3),
  
  -- DHT11
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  
  -- PIR
  occupancy SMALLINT CHECK (occupancy IN (0, 1)),
  
  -- Calculated
  carbon_rate DECIMAL(8,3),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_timestamp ON sensor_readings(device_id, timestamp DESC);
```

---

## 🧪 Testing

### 1. Test Individual Sensors

```cpp
// Test PZEM
void testPZEM() {
  Serial.println("Testing PZEM-004T...");
  Serial.printf("Voltage: %.2f V\n", pzem.voltage());
  Serial.printf("Current: %.2f A\n", pzem.current());
  Serial.printf("Power: %.2f W\n", pzem.power());
}

// Test PIR
void testPIR() {
  Serial.println("Testing PIR...");
  Serial.printf("Occupancy: %d\n", digitalRead(PIR_PIN));
}

// Test DHT
void testDHT() {
  Serial.println("Testing DHT11...");
  Serial.printf("Temp: %.1f °C\n", dht.readTemperature());
  Serial.printf("Humidity: %.1f %%\n", dht.readHumidity());
}
```

### 2. Monitor Serial Output

Open Serial Monitor (115200 baud) to see:
- WiFi connection status
- MQTT connection status
- Sensor readings
- JSON packets
- Publish confirmations

### 3. Verify MQTT Messages

Use MQTT Explorer or mosquitto_sub:

```bash
mosquitto_sub -h your-broker.com -t "campus/sensors/#" -v
```

---

## 🔧 Troubleshooting

### PZEM-004T Not Reading

- Check RX/TX connections (they should be crossed)
- Verify 5V power supply
- Ensure AC load is connected
- Try resetting PZEM energy counter

### PIR Always 0 or 1

- Adjust sensitivity potentiometer
- Check delay time potentiometer
- Verify 5V power
- Wait for warm-up period (30-60 seconds)

### DHT11 Returns NaN

- Check data pin connection
- Add 10kΩ pull-up resistor between DATA and VCC
- Verify 3.3V power
- Try different DHT11 module

### WiFi Won't Connect

- Check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Move closer to router
- Check router firewall settings

### MQTT Connection Fails

- Verify broker address and port
- Check username/password
- Ensure broker allows external connections
- Test with MQTT Explorer first

---

## 📊 Expected Data Flow

```
ESP32 Sensors → WiFi → MQTT Broker → Backend → Database
     ↓                                    ↓
  5 seconds                         Calculations
  interval                          (Energy, Carbon, Cost)
                                           ↓
                                    Frontend Dashboard
                                    (Real-time display)
```

---

## 🎯 Deployment Checklist

- [ ] All sensors wired correctly
- [ ] WiFi credentials configured
- [ ] MQTT broker accessible
- [ ] Device ID unique for each room
- [ ] Code uploaded to ESP32
- [ ] Serial monitor shows successful readings
- [ ] MQTT messages received by backend
- [ ] Data stored in database
- [ ] Dashboard displays real-time data
- [ ] Wastage alerts working
- [ ] All calculations accurate

---

## 📝 Device ID Mapping

Configure different device IDs for each room:

| Device ID | Location | Zone |
|-----------|----------|------|
| ROOM1 | Room 101 | Block A |
| ROOM2 | Room 102 | Block A |
| ROOM3 | Room 201 | Block B |
| HOSTEL1 | Hostel Room 1 | Hostel Zone |
| LAB1 | Computer Lab 1 | CSE Dept |
| LIBRARY | Library | Main Campus |

Update in code:
```cpp
const char* DEVICE_ID = "ROOM1";  // Change for each ESP32
const char* MQTT_TOPIC = "campus/sensors/ROOM1";  // Match device ID
```

---

## 🚀 Production Tips

1. **Use Static IPs**: Assign static IPs to ESP32 devices
2. **Add Watchdog**: Implement watchdog timer for auto-restart
3. **OTA Updates**: Enable Over-The-Air firmware updates
4. **Error Logging**: Log errors to SD card or cloud
5. **Battery Backup**: Add UPS for continuous operation
6. **Enclosure**: Use proper enclosure for safety
7. **Labeling**: Label each device with ID and location

---

**Your ESP32 hardware is now fully integrated with the GreenIndex backend! 🎉**
