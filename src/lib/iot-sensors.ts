/**
 * IoT Sensor Integration System with Real Formulas
 * 
 * This module provides a real-time sensor data simulation that can be easily
 * replaced with actual IoT sensor APIs (MQTT, WebSocket, REST, etc.)
 * 
 * FORMULAS USED (EXACT + SIMPLE):
 * 1. Power: P(W) = V × I (handled by PZEM-004T)
 * 2. Energy: Energy(kWh) = [Power(W) × Time(hours)] / 1000
 * 3. Carbon: CO₂(kg) = Energy(kWh) × 0.82 (India emission factor)
 * 4. Carbon Rate: Carbon Rate(kg/hr) = Power(kW) × 0.82
 * 5. Wastage: IF occupancy == 0 AND power > threshold AND duration > 10min → WASTAGE
 * 6. Green Score: 100 - [(Energy Used / Max Expected) × 100]
 */

// Constants for calculations
export const EMISSION_FACTOR_INDIA = 0.82; // kg CO₂ per kWh (academic average for India)
export const ELECTRICITY_RATE_INR = 8.5; // ₹ per kWh (campus average)
export const WATER_RATE_INR = 0.24; // ₹ per liter
export const WASTE_DISPOSAL_RATE_INR = 4.5; // ₹ per kg
export const FUEL_RATE_INR = 90; // ₹ per liter

/**
 * EXACT DATA STRUCTURE FROM ESP32 + SENSORS
 * This matches the MQTT payload from your hardware
 */
export interface ESP32SensorPacket {
  deviceId: string;           // ESP32 adds: Which room/device
  timestamp: number;          // ESP32 adds: Unix timestamp
  voltage: number;            // PZEM-004T: AC voltage (V)
  current: number;            // PZEM-004T: Current (A)
  power: number;              // PZEM-004T: Instant power (W)
  energy: number;             // PZEM-004T: Total energy (kWh)
  temperature: number;        // DHT11: Temperature (°C)
  humidity: number;           // DHT11: Humidity (%)
  occupancy: 0 | 1;          // PIR: 0 = empty, 1 = occupied
}

/**
 * Internal sensor reading format (converted from ESP32 packet)
 */
export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number; // Power in W for energy sensors
  unit: string;
  category: 'energy' | 'water' | 'waste' | 'transport';
  zone: string;
  status: 'normal' | 'high' | 'low' | 'offline';
  // PZEM-004T fields
  voltage?: number; // V (volts)
  current?: number; // A (amps)
  power?: number; // W (watts)
  energy?: number; // kWh (cumulative)
  // PIR field
  occupancy?: 0 | 1; // Motion detection
  // DHT11 fields
  temperature?: number; // °C
  humidity?: number; // %
  // Calculated fields
  carbonRate?: number; // kg CO₂ per hour
}

export interface AggregatedData {
  category: string;
  current: number;
  average: number;
  peak: number;
  trend: number[];
  lastUpdated: Date;
  // Calculated metrics
  energyConsumed?: number; // kWh (for energy category)
  carbonEmitted?: number; // kg CO₂
  cost?: number; // ₹ (INR)
  wastageDetected?: boolean;
  greenScore?: number; // 0-100
}

export interface EnergyCalculations {
  powerW: number; // Watts
  powerKW: number; // Kilowatts
  energyKWh: number; // Energy consumed in kWh
  carbonKg: number; // CO₂ emissions in kg
  carbonRateKgPerHr: number; // Real-time carbon rate
  costINR: number; // Cost in Indian Rupees
  duration: number; // Hours
}

export interface WastageAlert {
  sensorId: string;
  zone: string;
  powerW: number;
  duration: number; // minutes
  occupancy: number;
  estimatedWaste: number; // kWh
  carbonWasted: number; // kg CO₂
  costWasted: number; // ₹
}

// Simulated sensor data generator (replace with real IoT API)
class IoTSensorManager {
  private sensors: Map<string, SensorReading> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(data: SensorReading) => void> = new Set();
  private energyHistory: Map<string, { timestamp: Date; energy: number }[]> = new Map();
  private wastageAlerts: WastageAlert[] = [];

  constructor() {
    this.initializeSensors();
  }

  /**
   * FORMULA 2: Energy Consumption (MOST IMPORTANT)
   * Energy(kWh) = [Power(W) × Time(hours)] / 1000
   */
  calculateEnergy(powerW: number, timeHours: number): number {
    return (powerW * timeHours) / 1000;
  }

  /**
   * FORMULA 3: Carbon Emission (CORE INNOVATION)
   * CO₂(kg) = Energy(kWh) × 0.82
   */
  calculateCarbon(energyKWh: number): number {
    return energyKWh * EMISSION_FACTOR_INDIA;
  }

  /**
   * FORMULA 4: Real-Time Carbon Rate
   * Carbon Rate(kg/hr) = Power(kW) × 0.82
   */
  calculateCarbonRate(powerKW: number): number {
    return powerKW * EMISSION_FACTOR_INDIA;
  }

  /**
   * FORMULA 5: Wastage Detection (Rule-Based)
   * IF occupancy == 0 AND power > 150W AND duration > 10 minutes → WASTAGE
   */
  detectWastage(sensorId: string, powerW: number, occupancy: 0 | 1, durationMinutes: number): boolean {
    const WASTAGE_THRESHOLD_W = 150;
    const WASTAGE_DURATION_MIN = 10;
    
    return occupancy === 0 && powerW > WASTAGE_THRESHOLD_W && durationMinutes > WASTAGE_DURATION_MIN;
  }

  /**
   * FORMULA 6: Green Score (Efficiency)
   * Score = 100 - [(Energy Used / Max Expected) × 100]
   */
  calculateGreenScore(energyUsed: number, maxExpected: number): number {
    if (maxExpected === 0) return 100;
    const score = 100 - ((energyUsed / maxExpected) * 100);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Complete energy calculations for a sensor reading
   */
  getEnergyCalculations(powerW: number, durationHours: number = 1): EnergyCalculations {
    const powerKW = powerW / 1000;
    const energyKWh = this.calculateEnergy(powerW, durationHours);
    const carbonKg = this.calculateCarbon(energyKWh);
    const carbonRateKgPerHr = this.calculateCarbonRate(powerKW);
    const costINR = energyKWh * ELECTRICITY_RATE_INR;

    return {
      powerW,
      powerKW,
      energyKWh: parseFloat(energyKWh.toFixed(3)),
      carbonKg: parseFloat(carbonKg.toFixed(3)),
      carbonRateKgPerHr: parseFloat(carbonRateKgPerHr.toFixed(3)),
      costINR: parseFloat(costINR.toFixed(2)),
      duration: durationHours,
    };
  }

  /**
   * Process ESP32 sensor packet (MQTT payload)
   * Converts hardware data to internal format
   */
  processESP32Packet(packet: ESP32SensorPacket): SensorReading {
    // Convert Unix timestamp to Date
    const timestamp = new Date(packet.timestamp * 1000);
    
    // Determine zone from deviceId (e.g., "ROOM1" → "Block A")
    const zone = this.getZoneFromDeviceId(packet.deviceId);
    
    // Calculate carbon rate
    const carbonRate = this.calculateCarbonRate(packet.power / 1000);
    
    // Determine status based on thresholds
    let status: 'normal' | 'high' | 'low' | 'offline' = 'normal';
    if (packet.power > 15000) status = 'high'; // > 15kW
    if (packet.power < 100) status = 'low';    // < 100W
    
    // Check for wastage
    const durationMinutes = 15; // You can track this in your backend
    if (this.detectWastage(packet.deviceId, packet.power, packet.occupancy, durationMinutes)) {
      const wasteEnergy = this.calculateEnergy(packet.power, durationMinutes / 60);
      const wasteCarbon = this.calculateCarbon(wasteEnergy);
      const wasteCost = wasteEnergy * ELECTRICITY_RATE_INR;
      
      this.wastageAlerts.push({
        sensorId: packet.deviceId,
        zone,
        powerW: packet.power,
        duration: durationMinutes,
        occupancy: packet.occupancy,
        estimatedWaste: parseFloat(wasteEnergy.toFixed(3)),
        carbonWasted: parseFloat(wasteCarbon.toFixed(3)),
        costWasted: parseFloat(wasteCost.toFixed(2)),
      });
      
      // Keep only last 10 alerts
      if (this.wastageAlerts.length > 10) {
        this.wastageAlerts.shift();
      }
    }
    
    const reading: SensorReading = {
      sensorId: packet.deviceId,
      timestamp,
      value: packet.power, // Use power as primary value
      unit: 'W',
      category: 'energy',
      zone,
      status,
      // PZEM-004T data
      voltage: packet.voltage,
      current: packet.current,
      power: packet.power,
      energy: packet.energy,
      // PIR data
      occupancy: packet.occupancy,
      // DHT11 data
      temperature: packet.temperature,
      humidity: packet.humidity,
      // Calculated
      carbonRate,
    };
    
    // Store in sensors map
    this.sensors.set(packet.deviceId, reading);
    
    // Store energy history
    const history = this.energyHistory.get(packet.deviceId) || [];
    history.push({ timestamp, energy: packet.energy });
    if (history.length > 100) history.shift();
    this.energyHistory.set(packet.deviceId, history);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(reading));
    
    return reading;
  }

  /**
   * Map deviceId to zone name
   * Customize this based on your campus layout
   */
  private getZoneFromDeviceId(deviceId: string): string {
    const zoneMap: Record<string, string> = {
      'ROOM1': 'Block A',
      'ROOM2': 'Block A',
      'ROOM3': 'Block B',
      'ROOM4': 'Block B',
      'HOSTEL1': 'Hostel Zone',
      'HOSTEL2': 'Hostel Zone',
      'LAB1': 'CSE Dept',
      'LAB2': 'CSE Dept',
      'LIBRARY': 'Main Campus',
      'CAFETERIA': 'Main Campus',
    };
    
    return zoneMap[deviceId] || 'Unknown Zone';
  }

  private initializeSensors() {
    // Initialize sensor baseline data
    // Energy sensors use Power (W) as value
    const sensorConfigs = [
      { 
        id: 'energy-meter-1', 
        category: 'energy' as const, 
        zone: 'Block A', 
        baseValue: 12500, // 12.5 kW = 12500 W
        unit: 'W',
        voltage: 230,
        current: 54.3,
        occupancy: 1,
      },
      { 
        id: 'energy-meter-2', 
        category: 'energy' as const, 
        zone: 'Block B', 
        baseValue: 18300, // 18.3 kW = 18300 W
        unit: 'W',
        voltage: 230,
        current: 79.6,
        occupancy: 1,
      },
      { 
        id: 'energy-meter-3', 
        category: 'energy' as const, 
        zone: 'Hostel Zone', 
        baseValue: 24700, // 24.7 kW = 24700 W
        unit: 'W',
        voltage: 230,
        current: 107.4,
        occupancy: 1,
      },
      { id: 'water-flow-1', category: 'water' as const, zone: 'Main Campus', baseValue: 145, unit: 'L/min' },
      { id: 'water-flow-2', category: 'water' as const, zone: 'Block A', baseValue: 98, unit: 'L/min' },
      { id: 'water-flow-3', category: 'water' as const, zone: 'Hostel Zone', baseValue: 210, unit: 'L/min' },
      { id: 'waste-sensor-1', category: 'waste' as const, zone: 'Main Campus', baseValue: 65, unit: '%' },
      { id: 'waste-sensor-2', category: 'waste' as const, zone: 'Hostel Zone', baseValue: 58, unit: '%' },
      { id: 'transport-1', category: 'transport' as const, zone: 'Parking', baseValue: 12, unit: 'vehicles' },
    ];

    sensorConfigs.forEach(config => {
      const reading: SensorReading = {
        sensorId: config.id,
        timestamp: new Date(),
        value: config.baseValue,
        unit: config.unit,
        category: config.category,
        zone: config.zone,
        status: 'normal',
      };

      // Add energy-specific fields
      if (config.category === 'energy') {
        reading.voltage = config.voltage;
        reading.current = config.current;
        reading.power = config.baseValue; // Power in W
        reading.energy = 0; // Cumulative energy starts at 0
        reading.carbonRate = this.calculateCarbonRate(config.baseValue / 1000);
        reading.occupancy = config.occupancy;
      }

      this.sensors.set(config.id, reading);
      this.energyHistory.set(config.id, []);
    });
  }

  // Simulate real-time sensor updates
  startRealTimeUpdates(intervalMs: number = 5000) {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      this.sensors.forEach((reading, sensorId) => {
        // Simulate sensor value changes (±5% variation)
        const baseValue = reading.value;
        const variation = (Math.random() - 0.5) * 0.1 * baseValue;
        const newValue = Math.max(0, baseValue + variation);

        // For energy sensors, update all related fields
        if (reading.category === 'energy') {
          const powerW = newValue;
          const powerKW = powerW / 1000;
          
          // Simulate occupancy changes (10% chance of change)
          const occupancy = Math.random() < 0.1 ? (reading.occupancy === 1 ? 0 : 1) : (reading.occupancy || 1);
          
          // Calculate energy increment (intervalMs / 1000 / 3600 = hours)
          const timeHours = intervalMs / 1000 / 3600;
          const energyIncrement = this.calculateEnergy(powerW, timeHours);
          const cumulativeEnergy = (reading.energy || 0) + energyIncrement;
          
          // Calculate carbon rate
          const carbonRate = this.calculateCarbonRate(powerKW);
          
          // Detect wastage
          const durationMinutes = 15; // Assume 15 minutes for simulation
          if (this.detectWastage(sensorId, powerW, occupancy, durationMinutes)) {
            const wasteEnergy = this.calculateEnergy(powerW, durationMinutes / 60);
            const wasteCarbon = this.calculateCarbon(wasteEnergy);
            const wasteCost = wasteEnergy * ELECTRICITY_RATE_INR;
            
            this.wastageAlerts.push({
              sensorId,
              zone: reading.zone,
              powerW,
              duration: durationMinutes,
              occupancy,
              estimatedWaste: parseFloat(wasteEnergy.toFixed(3)),
              carbonWasted: parseFloat(wasteCarbon.toFixed(3)),
              costWasted: parseFloat(wasteCost.toFixed(2)),
            });
            
            // Keep only last 10 alerts
            if (this.wastageAlerts.length > 10) {
              this.wastageAlerts.shift();
            }
          }

          // Determine status based on thresholds
          let status: 'normal' | 'high' | 'low' | 'offline' = 'normal';
          if (powerW > baseValue * 1.2) status = 'high';
          if (powerW < baseValue * 0.3) status = 'low';
          if (Math.random() < 0.02) status = 'offline'; // 2% chance of offline

          const updatedReading: SensorReading = {
            ...reading,
            value: parseFloat(newValue.toFixed(2)),
            timestamp: new Date(),
            status,
            power: parseFloat(powerW.toFixed(2)),
            energy: parseFloat(cumulativeEnergy.toFixed(3)),
            carbonRate: parseFloat(carbonRate.toFixed(3)),
            occupancy,
            voltage: reading.voltage,
            current: parseFloat((powerW / (reading.voltage || 230)).toFixed(2)),
          };

          this.sensors.set(sensorId, updatedReading);
          
          // Store energy history
          const history = this.energyHistory.get(sensorId) || [];
          history.push({ timestamp: new Date(), energy: cumulativeEnergy });
          if (history.length > 100) history.shift(); // Keep last 100 readings
          this.energyHistory.set(sensorId, history);
        } else {
          // Non-energy sensors
          let status: 'normal' | 'high' | 'low' | 'offline' = 'normal';
          if (reading.category === 'water' && newValue > baseValue * 1.15) status = 'high';
          if (newValue < baseValue * 0.3) status = 'low';
          if (Math.random() < 0.02) status = 'offline';

          const updatedReading: SensorReading = {
            ...reading,
            value: parseFloat(newValue.toFixed(2)),
            timestamp: new Date(),
            status,
          };

          this.sensors.set(sensorId, updatedReading);
        }

        // Notify listeners
        const updatedReading = this.sensors.get(sensorId);
        if (updatedReading) {
          this.listeners.forEach(listener => listener(updatedReading));
        }
      });
    }, intervalMs);
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Subscribe to real-time updates
  subscribe(callback: (data: SensorReading) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Get current readings for a category
  getCategoryData(category: 'energy' | 'water' | 'waste' | 'transport' | 'all'): SensorReading[] {
    const readings = Array.from(this.sensors.values());
    if (category === 'all') return readings;
    return readings.filter(r => r.category === category);
  }

  // Get aggregated data for analytics
  getAggregatedData(category: 'energy' | 'water' | 'waste' | 'transport'): AggregatedData {
    const readings = this.getCategoryData(category);
    const values = readings.map(r => r.value);
    
    const current = values.reduce((a, b) => a + b, 0) / values.length;
    const peak = Math.max(...values);
    
    // Generate trend data (last 7 days simulation)
    const trend = Array.from({ length: 7 }, (_, i) => {
      const dayVariation = Math.sin(i * 0.5) * 5;
      return parseFloat((current + dayVariation).toFixed(1));
    });

    const result: AggregatedData = {
      category,
      current: parseFloat(current.toFixed(2)),
      average: parseFloat((current * 0.95).toFixed(2)),
      peak: parseFloat(peak.toFixed(2)),
      trend,
      lastUpdated: new Date(),
    };

    // Add energy-specific calculations
    if (category === 'energy') {
      // Calculate total energy consumed (assuming 24 hours)
      const totalPowerW = values.reduce((a, b) => a + b, 0);
      const energyKWh = this.calculateEnergy(totalPowerW, 24);
      const carbonKg = this.calculateCarbon(energyKWh);
      const costINR = energyKWh * ELECTRICITY_RATE_INR;
      
      // Calculate green score (max expected = 150% of average)
      const maxExpected = result.average * 1.5;
      const greenScore = this.calculateGreenScore(current, maxExpected);
      
      result.energyConsumed = parseFloat(energyKWh.toFixed(2));
      result.carbonEmitted = parseFloat(carbonKg.toFixed(2));
      result.cost = parseFloat(costINR.toFixed(2));
      result.wastageDetected = this.wastageAlerts.length > 0;
      result.greenScore = greenScore;
    }

    return result;
  }

  // Get score based on category performance
  getCategoryScore(category: 'energy' | 'water' | 'waste' | 'transport'): number {
    const data = this.getAggregatedData(category);
    const baseScores = { energy: 68, water: 74, waste: 61, transport: 79 };
    
    // Adjust score based on current vs average
    const performanceRatio = data.average / data.current;
    const adjustment = (performanceRatio - 1) * 20;
    
    return Math.min(100, Math.max(0, Math.round(baseScores[category] + adjustment)));
  }

  // Get all sensors status
  getAllSensorsStatus() {
    return Array.from(this.sensors.values()).map(reading => {
      const base = {
        id: reading.sensorId,
        category: reading.category,
        zone: reading.zone,
        value: reading.value,
        unit: reading.unit,
        status: reading.status,
        lastUpdate: reading.timestamp,
      };

      // Add energy-specific fields
      if (reading.category === 'energy') {
        return {
          ...base,
          voltage: reading.voltage,
          current: reading.current,
          power: reading.power,
          powerKW: reading.power ? reading.power / 1000 : 0,
          energy: reading.energy,
          carbonRate: reading.carbonRate,
          occupancy: reading.occupancy,
        };
      }

      return base;
    });
  }

  // Get wastage alerts
  getWastageAlerts(): WastageAlert[] {
    return [...this.wastageAlerts];
  }

  // Get energy calculations for a specific sensor
  getSensorEnergyCalculations(sensorId: string, durationHours: number = 1): EnergyCalculations | null {
    const reading = this.sensors.get(sensorId);
    if (!reading || reading.category !== 'energy') return null;

    return this.getEnergyCalculations(reading.power || reading.value, durationHours);
  }

  // Get total campus energy metrics
  getTotalCampusMetrics() {
    const energyReadings = this.getCategoryData('energy');
    const totalPowerW = energyReadings.reduce((sum, r) => sum + (r.power || r.value), 0);
    const totalPowerKW = totalPowerW / 1000;
    
    // Calculate for 24 hours
    const dailyEnergyKWh = this.calculateEnergy(totalPowerW, 24);
    const dailyCarbonKg = this.calculateCarbon(dailyEnergyKWh);
    const dailyCostINR = dailyEnergyKWh * ELECTRICITY_RATE_INR;
    const carbonRateKgPerHr = this.calculateCarbonRate(totalPowerKW);

    // Monthly projections
    const monthlyEnergyKWh = dailyEnergyKWh * 30;
    const monthlyCarbonKg = dailyCarbonKg * 30;
    const monthlyCostINR = dailyCostINR * 30;

    return {
      realTime: {
        totalPowerW: parseFloat(totalPowerW.toFixed(2)),
        totalPowerKW: parseFloat(totalPowerKW.toFixed(2)),
        carbonRateKgPerHr: parseFloat(carbonRateKgPerHr.toFixed(3)),
      },
      daily: {
        energyKWh: parseFloat(dailyEnergyKWh.toFixed(2)),
        carbonKg: parseFloat(dailyCarbonKg.toFixed(2)),
        costINR: parseFloat(dailyCostINR.toFixed(2)),
      },
      monthly: {
        energyKWh: parseFloat(monthlyEnergyKWh.toFixed(2)),
        carbonKg: parseFloat(monthlyCarbonKg.toFixed(2)),
        costINR: parseFloat(monthlyCostINR.toFixed(2)),
      },
      wastageAlerts: this.wastageAlerts.length,
    };
  }
}

// Singleton instance
export const iotManager = new IoTSensorManager();

// API Integration Templates (for real IoT systems)
export const IoTIntegrationTemplates = {
  // MQTT Integration Example
  mqtt: {
    broker: 'mqtt://your-broker.com:1883',
    topics: {
      energy: 'campus/sensors/energy/+',
      water: 'campus/sensors/water/+',
      waste: 'campus/sensors/waste/+',
      transport: 'campus/sensors/transport/+',
    },
    // Example: Connect to MQTT broker
    // const client = mqtt.connect(broker);
    // client.subscribe(topics.energy);
    // client.on('message', (topic, message) => { ... });
  },

  // WebSocket Integration Example
  websocket: {
    url: 'wss://your-iot-server.com/sensors',
    // Example: Connect to WebSocket
    // const ws = new WebSocket(url);
    // ws.onmessage = (event) => { const data = JSON.parse(event.data); };
  },

  // REST API Integration Example
  restApi: {
    baseUrl: 'https://your-api.com/api/v1',
    endpoints: {
      getSensors: '/sensors',
      getSensorData: '/sensors/:id/data',
      getAggregated: '/analytics/aggregated',
    },
    // Example: Fetch sensor data
    // fetch(`${baseUrl}/sensors`).then(res => res.json());
  },

  // ThingSpeak Integration Example
  thingSpeak: {
    channelId: 'YOUR_CHANNEL_ID',
    readApiKey: 'YOUR_READ_API_KEY',
    url: 'https://api.thingspeak.com/channels/:channelId/feeds.json',
    // Example: Fetch from ThingSpeak
    // fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}`);
  },

  // AWS IoT Core Integration Example
  awsIot: {
    endpoint: 'your-endpoint.iot.region.amazonaws.com',
    topic: 'campus/sensors/#',
    // Example: Use AWS IoT SDK
    // const device = awsIot.device({ ... });
    // device.subscribe(topic);
  },

  // Azure IoT Hub Integration Example
  azureIot: {
    connectionString: 'HostName=your-hub.azure-devices.net;...',
    // Example: Use Azure IoT SDK
    // const client = Client.fromConnectionString(connectionString);
    // client.on('message', (msg) => { ... });
  },
};

// Helper function to convert real sensor data to our format
export function normalizeSensorData(rawData: any, category: string): SensorReading {
  return {
    sensorId: rawData.id || rawData.sensor_id || 'unknown',
    timestamp: new Date(rawData.timestamp || Date.now()),
    value: parseFloat(rawData.value || rawData.reading || 0),
    unit: rawData.unit || 'units',
    category: category as any,
    zone: rawData.zone || rawData.location || 'Unknown',
    status: rawData.status || 'normal',
  };
}

// Export for use in components
export default iotManager;

/**
 * ============================================================================
 * MQTT INTEGRATION FOR ESP32 SENSORS
 * ============================================================================
 * 
 * This section shows how to connect your ESP32 sensors to the backend
 */

// Example MQTT Integration (Node.js Backend)
export const MQTTIntegrationExample = `
// Install: npm install mqtt

import mqtt from 'mqtt';
import { iotManager, ESP32SensorPacket } from './iot-sensors';

// Connect to MQTT broker
const client = mqtt.connect('mqtt://your-broker.com:1883', {
  username: 'your-username',
  password: 'your-password',
});

// Subscribe to sensor topics
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('campus/sensors/+', (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to campus/sensors/+');
    }
  });
});

// Process incoming sensor data
client.on('message', (topic, message) => {
  try {
    // Parse ESP32 packet
    const packet: ESP32SensorPacket = JSON.parse(message.toString());
    
    console.log('Received packet:', packet);
    
    // Validate packet structure
    if (!packet.deviceId || !packet.timestamp || packet.power === undefined) {
      console.error('Invalid packet structure:', packet);
      return;
    }
    
    // Process packet through IoT manager
    const reading = iotManager.processESP32Packet(packet);
    
    console.log('Processed reading:', {
      device: reading.sensorId,
      power: reading.power + 'W',
      energy: reading.energy + 'kWh',
      carbon: reading.carbonRate + 'kg CO₂/hr',
      occupancy: reading.occupancy === 1 ? 'Occupied' : 'Empty',
      temp: reading.temperature + '°C',
      humidity: reading.humidity + '%',
    });
    
    // Store in database (example with PostgreSQL)
    await db.sensorReadings.create({
      deviceId: packet.deviceId,
      timestamp: new Date(packet.timestamp * 1000),
      voltage: packet.voltage,
      current: packet.current,
      power: packet.power,
      energy: packet.energy,
      temperature: packet.temperature,
      humidity: packet.humidity,
      occupancy: packet.occupancy,
      carbonRate: reading.carbonRate,
    });
    
    // Check for wastage alerts
    const alerts = iotManager.getWastageAlerts();
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1];
      console.warn('⚠️ WASTAGE ALERT:', latestAlert);
      
      // Send notification (email, SMS, push notification)
      await sendAlert({
        type: 'wastage',
        device: latestAlert.sensorId,
        zone: latestAlert.zone,
        message: \`Wastage detected in \${latestAlert.zone}: \${latestAlert.powerW}W for \${latestAlert.duration} minutes. Cost: ₹\${latestAlert.costWasted}\`,
      });
    }
    
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

// Handle errors
client.on('error', (error) => {
  console.error('MQTT error:', error);
});

// Handle disconnection
client.on('close', () => {
  console.log('Disconnected from MQTT broker');
});
`;

// Example ESP32 Arduino Code
export const ESP32ArduinoExample = `
/*
 * ESP32 + PZEM-004T + PIR + DHT11
 * Complete sensor integration code
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT broker
const char* mqtt_server = "your-broker.com";
const int mqtt_port = 1883;
const char* mqtt_user = "your-username";
const char* mqtt_password = "your-password";
const char* mqtt_topic = "campus/sensors/ROOM1";

// Device ID
const char* deviceId = "ROOM1";

// Pin definitions
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17
#define PIR_PIN 18
#define DHT_PIN 19
#define DHT_TYPE DHT11

// Initialize sensors
PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);
DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // Initialize PIR
  pinMode(PIR_PIN, INPUT);
  
  // Initialize DHT
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected");
  
  // Connect to MQTT
  client.setServer(mqtt_server, mqtt_port);
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensors every 5 seconds
  static unsigned long lastRead = 0;
  if (millis() - lastRead > 5000) {
    lastRead = millis();
    
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
    
    // Check for valid readings
    if (isnan(voltage) || isnan(current)) {
      Serial.println("PZEM read error");
      return;
    }
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("DHT read error");
      return;
    }
    
    // Create JSON packet
    StaticJsonDocument<256> doc;
    doc["deviceId"] = deviceId;
    doc["timestamp"] = millis() / 1000; // Unix timestamp (you should use NTP)
    doc["voltage"] = voltage;
    doc["current"] = current;
    doc["power"] = power;
    doc["energy"] = energy;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["occupancy"] = occupancy;
    
    // Serialize to string
    char buffer[256];
    serializeJson(doc, buffer);
    
    // Publish to MQTT
    if (client.publish(mqtt_topic, buffer)) {
      Serial.println("Published: " + String(buffer));
    } else {
      Serial.println("Publish failed");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect(deviceId, mqtt_user, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}
`;

// Database Schema Example
export const DatabaseSchemaExample = `
-- PostgreSQL Schema for ESP32 Sensor Data

CREATE TABLE sensor_readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  
  -- PZEM-004T data
  voltage DECIMAL(6,2),
  current DECIMAL(6,2),
  power DECIMAL(8,2),
  energy DECIMAL(10,3),
  
  -- DHT11 data
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  
  -- PIR data
  occupancy SMALLINT CHECK (occupancy IN (0, 1)),
  
  -- Calculated fields
  carbon_rate DECIMAL(8,3),
  
  -- Indexes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast queries
CREATE INDEX idx_device_timestamp ON sensor_readings(device_id, timestamp DESC);
CREATE INDEX idx_timestamp ON sensor_readings(timestamp DESC);

-- Wastage alerts table
CREATE TABLE wastage_alerts (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  zone VARCHAR(100),
  power_w DECIMAL(8,2),
  duration_minutes INTEGER,
  occupancy SMALLINT,
  estimated_waste DECIMAL(10,3),
  carbon_wasted DECIMAL(8,3),
  cost_wasted DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Energy summary table (for faster analytics)
CREATE TABLE energy_summary (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  total_energy_kwh DECIMAL(10,3),
  total_carbon_kg DECIMAL(10,3),
  total_cost_inr DECIMAL(10,2),
  avg_power_w DECIMAL(8,2),
  max_power_w DECIMAL(8,2),
  occupancy_hours DECIMAL(5,2),
  UNIQUE(device_id, date)
);
`;

// API Endpoint Example
export const APIEndpointExample = `
// Express.js API endpoint for receiving ESP32 data

import express from 'express';
import { iotManager, ESP32SensorPacket } from './iot-sensors';

const app = express();
app.use(express.json());

// POST endpoint for ESP32 to send data directly (alternative to MQTT)
app.post('/api/sensors/reading', async (req, res) => {
  try {
    const packet: ESP32SensorPacket = req.body;
    
    // Validate packet
    if (!packet.deviceId || !packet.timestamp || packet.power === undefined) {
      return res.status(400).json({ error: 'Invalid packet structure' });
    }
    
    // Process packet
    const reading = iotManager.processESP32Packet(packet);
    
    // Store in database
    await db.sensorReadings.create({
      deviceId: packet.deviceId,
      timestamp: new Date(packet.timestamp * 1000),
      voltage: packet.voltage,
      current: packet.current,
      power: packet.power,
      energy: packet.energy,
      temperature: packet.temperature,
      humidity: packet.humidity,
      occupancy: packet.occupancy,
      carbonRate: reading.carbonRate,
    });
    
    // Return calculated metrics
    res.json({
      success: true,
      reading: {
        deviceId: reading.sensorId,
        power: reading.power,
        carbonRate: reading.carbonRate,
        status: reading.status,
      },
      calculations: iotManager.getEnergyCalculations(packet.power, 1),
    });
    
  } catch (error) {
    console.error('Error processing sensor reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint for retrieving sensor data
app.get('/api/sensors/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { from, to } = req.query;
    
    const readings = await db.sensorReadings.findAll({
      where: {
        deviceId,
        timestamp: {
          gte: new Date(from as string),
          lte: new Date(to as string),
        },
      },
      order: [['timestamp', 'DESC']],
      limit: 1000,
    });
    
    res.json({ success: true, readings });
    
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('API server running on port 3000');
});
`;

