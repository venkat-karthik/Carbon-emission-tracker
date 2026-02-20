#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFi.h>

// ---------------------------------------------------------------- //
// CONFIGURATION
// ---------------------------------------------------------------- //
const char *ssid = "YOUR_WIFI_SSID";         // Replace with your WiFi name
const char *password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password

// Important: This must be the IP address of your Mac running the Mosquitto
// broker Find it by running 'ifconfig' or checking Network Settings on your Mac
const char *mqtt_server = "172.18.7.234";
const int mqtt_port = 1883;

// The standard topic the bridge script is listening for
const char *mqtt_topic = "greenindex/sensors/energy";

// ---------------------------------------------------------------- //
// SETUP
// ---------------------------------------------------------------- //
WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

// ---------------------------------------------------------------- //
// MAIN LOOP
// ---------------------------------------------------------------- //
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Create the JSON document
  // Structure must match ESP32SensorPacket in Next.js
  StaticJsonDocument<256> doc;

  doc["deviceId"] = "LAB1_NODE1";

  // ESP32 usually doesn't have a reliable RTC without NTP sync.
  // For production, you'd sync time. For simple testing,
  // you might let the backend assign the timestamp if it's missing,
  // but our API currently requires it.
  // We'll simulate a basic Unix timestamp here, but in reality use an NTP
  // library. Example hardcoded fallback (replace with real NTP time in
  // production!):
  doc["timestamp"] = 1708450000;

  // Read actual sensor values here
  // float voltage = analogRead(xxx) * factor;
  doc["voltage"] = random(2200, 2300) / 10.0;
  doc["current"] = random(100, 200) / 100.0;
  doc["power"] = (float)doc["voltage"] * (float)doc["current"];
  doc["energy"] = 2.8;
  doc["temperature"] = random(240, 260) / 10.0;
  doc["humidity"] = random(500, 600) / 10.0;
  doc["occupancy"] = random(0, 2);

  // Serialize to string
  char buffer[256];
  serializeJson(doc, buffer);

  Serial.print("Publishing message: ");
  Serial.println(buffer);

  // Publish to broker
  client.publish(mqtt_topic, buffer);

  // Wait 5 seconds
  delay(5000);
}
