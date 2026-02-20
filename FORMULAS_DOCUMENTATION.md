# GreenIndex Formulas Documentation

## 📐 EXACT FORMULAS USED (SIMPLE + ACCURATE)

This document explains all the mathematical formulas used in the GreenIndex Campus Dashboard for calculating energy consumption, carbon emissions, costs, and sustainability metrics.

---

## 🔹 Formula 1: Electrical Power

```
P(W) = V × I
```

**Where:**
- `P` = Power in Watts (W)
- `V` = Voltage in Volts (V)
- `I` = Current in Amperes (A)

**Example:**
```
230V × 1.5A = 345W
```

**Usage in System:**
- ✅ Calculated internally by PZEM-004T sensor
- ✅ ESP32 reads this value directly
- ❌ Backend does NOT calculate this (sensor does it)

**Why This Matters:**
Power tells you instant consumption. You can see when a fan is ON vs OFF in real-time.

**⚠️ Hackathon Note:**
PZEM already gives you power. You don't need to calculate this yourself!

---

## 🔹 Formula 2: Energy Consumption (MOST IMPORTANT)

```
Energy(kWh) = [Power(W) × Time(hours)] / 1000
```

**Where:**
- `Energy` = Energy consumed in kilowatt-hours (kWh)
- `Power` = Power in Watts (W)
- `Time` = Duration in hours (h)
- `1000` = Conversion factor (W to kW)

**Example:**
```
400W for 2 hours
Energy = (400 × 2) / 1000 = 0.8 kWh
```

**Usage in System:**
- ✅ Backend calculates this from sensor power readings
- ✅ Used for billing calculations
- ✅ Used for reports and analytics
- ✅ Stored in database for historical analysis

**Why This Matters:**
- Electricity bills are based on kWh
- Carbon emissions depend on kWh
- Reports are based on kWh
- **This is non-negotiable for any energy monitoring system**

**Implementation:**
```typescript
calculateEnergy(powerW: number, timeHours: number): number {
  return (powerW * timeHours) / 1000;
}
```

---

## 🔹 Formula 3: Carbon Emission (CORE INNOVATION)

```
CO₂(kg) = Energy(kWh) × Emission Factor
```

**For India (Academic Average):**
```
Emission Factor ≈ 0.82 kg CO₂ / kWh
```

**Example:**
```
5 kWh × 0.82 = 4.1 kg CO₂
```

**Usage in System:**
- ✅ Backend calculates from energy consumption
- ✅ Displayed in dashboard and reports
- ✅ Used for sustainability scoring
- ✅ Basis for carbon reduction recommendations

**Why This Matters:**
- Electricity numbers (kWh) don't emotionally connect with people
- Carbon numbers (kg CO₂) do!
- This turns energy monitoring into a climate solution
- **This is the main reason your project stands out**

**Implementation:**
```typescript
const EMISSION_FACTOR_INDIA = 0.82; // kg CO₂ per kWh

calculateCarbon(energyKWh: number): number {
  return energyKWh * EMISSION_FACTOR_INDIA;
}
```

**Real-World Context:**
- 1 kg CO₂ = driving a car for ~4 km
- 100 kg CO₂ = one tree absorbs this in ~1 year
- 1000 kg CO₂ = one person's monthly carbon footprint

---

## 🔹 Formula 4: Real-Time Carbon Rate (Optional but Cool)

```
Carbon Rate(kg/hr) = Power(kW) × Emission Factor
```

**Example:**
```
0.4 kW × 0.82 = 0.328 kg CO₂ per hour
```

**Usage in System:**
- ✅ Displayed in real-time dashboard
- ✅ Shows "carbon per hour" live
- ✅ Very impressive visually
- ⚠️ Optional for hackathon (but recommended!)

**Why This Matters:**
- Shows immediate impact of current power usage
- Helps users understand real-time carbon footprint
- Creates urgency for energy-saving actions

**Implementation:**
```typescript
calculateCarbonRate(powerKW: number): number {
  return powerKW * EMISSION_FACTOR_INDIA;
}
```

---

## 🔹 Formula 5: Wastage Detection (Rule-Based)

```
IF occupancy == 0 AND power > 150W AND duration > 10 minutes
  → WASTAGE DETECTED
```

**Logic:**
- `occupancy` = 0 (no one present)
- `power` > 150W (significant consumption)
- `duration` > 10 minutes (not just temporary)

**Example:**
```
Room empty (occupancy = 0)
Lights + AC consuming 800W
Duration: 15 minutes
→ WASTAGE ALERT!
```

**Usage in System:**
- ✅ Backend checks this rule every sensor update
- ✅ Generates alerts when wastage detected
- ✅ Calculates wasted energy, carbon, and cost
- ✅ Sends notifications to facility managers

**Why This Matters:**
- Turns monitoring into action
- No machine learning required
- Judges love rule-based clarity
- Immediate cost savings

**Implementation:**
```typescript
detectWastage(
  sensorId: string, 
  powerW: number, 
  occupancy: number, 
  durationMinutes: number
): boolean {
  const WASTAGE_THRESHOLD_W = 150;
  const WASTAGE_DURATION_MIN = 10;
  
  return occupancy === 0 
    && powerW > WASTAGE_THRESHOLD_W 
    && durationMinutes > WASTAGE_DURATION_MIN;
}
```

---

## 🔹 Formula 6: Green Score / Efficiency (Optional)

```
Score = 100 - [(Energy Used / Max Expected) × 100]
```

**Example:**
```
Energy Used: 80 kWh
Max Expected: 100 kWh
Score = 100 - [(80 / 100) × 100] = 100 - 80 = 20
```

**Usage in System:**
- ✅ Used for leaderboards
- ✅ Gamification of energy saving
- ✅ Department/building comparisons
- ⚠️ Optional for hackathon

**Why This Matters:**
- Creates competition between departments
- Motivates energy-saving behavior
- Easy to understand (0-100 scale)

**Implementation:**
```typescript
calculateGreenScore(energyUsed: number, maxExpected: number): number {
  if (maxExpected === 0) return 100;
  const score = 100 - ((energyUsed / maxExpected) * 100);
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

---

## 📊 WHERE EACH FORMULA IS USED IN YOUR SYSTEM

| Formula | Used In | Why |
|---------|---------|-----|
| **Power** | ESP32 / PZEM | Instant consumption |
| **Energy** | Backend | Billing + reporting |
| **Carbon** | Backend | Sustainability |
| **Carbon Rate** | Backend | Live insight |
| **Wastage Rule** | Backend | Alerts |
| **Score** | Dashboard | Comparison |

---

## 🏗️ ARCHITECTURE PRINCIPLES

### ✅ Separation of Concerns

1. **ESP32 (Hardware Layer)**
   - Reads voltage, current from PZEM
   - Gets power value from PZEM
   - Sends data to backend via MQTT/HTTP
   - Does NOT calculate carbon
   - Does NOT detect wastage

2. **Backend (Business Logic Layer)**
   - Receives sensor data
   - Calculates energy consumption
   - Calculates carbon emissions
   - Detects wastage patterns
   - Generates alerts
   - Stores data in database

3. **Frontend (Presentation Layer)**
   - Displays real-time data
   - Shows charts and graphs
   - Presents alerts and recommendations
   - Does NOT perform calculations

**Why This Matters:**
- Clean architecture
- Easy to maintain
- Easy to scale
- Judges appreciate good design

---

## 💰 COST CALCULATIONS

### Electricity Cost
```
Cost(₹) = Energy(kWh) × Rate(₹/kWh)
```

**India Campus Average:**
```
Rate ≈ ₹8.50 per kWh
```

**Example:**
```
100 kWh × ₹8.50 = ₹850
```

### Water Cost
```
Cost(₹) = Volume(L) × Rate(₹/L)
```

**Campus Average:**
```
Rate ≈ ₹0.24 per liter
```

### Waste Disposal Cost
```
Cost(₹) = Weight(kg) × Rate(₹/kg)
```

**Campus Average:**
```
Rate ≈ ₹4.50 per kg
```

### Transport Fuel Cost
```
Cost(₹) = Volume(L) × Rate(₹/L)
```

**Current Rate:**
```
Rate ≈ ₹90 per liter (petrol)
```

---

## 📈 EXAMPLE CALCULATIONS

### Scenario: Block A for 1 Day

**Given:**
- Average Power: 12,500W (12.5 kW)
- Duration: 24 hours

**Calculations:**

1. **Energy Consumption:**
   ```
   Energy = (12,500 × 24) / 1000 = 300 kWh
   ```

2. **Carbon Emission:**
   ```
   CO₂ = 300 × 0.82 = 246 kg
   ```

3. **Cost:**
   ```
   Cost = 300 × 8.50 = ₹2,550
   ```

4. **Carbon Rate (Real-time):**
   ```
   Rate = 12.5 × 0.82 = 10.25 kg CO₂/hour
   ```

5. **Monthly Projection:**
   ```
   Energy = 300 × 30 = 9,000 kWh
   CO₂ = 246 × 30 = 7,380 kg
   Cost = 2,550 × 30 = ₹76,500
   ```

---

## 🎯 HACKATHON TIPS

### What Judges Want to See:

1. ✅ **Clear Formula Documentation** (this file!)
2. ✅ **Real-time Calculations** (carbon rate)
3. ✅ **Actionable Insights** (wastage detection)
4. ✅ **Cost Savings** (show ₹ saved)
5. ✅ **Environmental Impact** (show kg CO₂ reduced)

### What Makes Your Project Stand Out:

1. 🌟 **Carbon Focus** - Not just energy, but environmental impact
2. 🌟 **Rule-Based Intelligence** - No ML needed, still smart
3. 🌟 **Real-time Monitoring** - Live updates every 5 seconds
4. 🌟 **Cost Analysis** - Shows ROI and payback periods
5. 🌟 **Actionable Recommendations** - De-carbonizer index

### Common Mistakes to Avoid:

1. ❌ Don't calculate power in backend (PZEM does it)
2. ❌ Don't use wrong emission factors (use 0.82 for India)
3. ❌ Don't forget to convert W to kW (divide by 1000)
4. ❌ Don't mix up energy (kWh) and power (kW)
5. ❌ Don't claim ML when using rules (be honest!)

---

## 🔗 REFERENCES

- **India Grid Emission Factor:** Central Electricity Authority (CEA) CO₂ Baseline Database
- **PZEM-004T Datasheet:** Peacefair Energy Monitor Specifications
- **Electricity Rates:** State Electricity Board Average Tariffs
- **Carbon Equivalents:** EPA Greenhouse Gas Equivalencies Calculator

---

## 📝 SUMMARY

The GreenIndex system uses 6 core formulas:

1. **Power** (P = V × I) - Sensor calculates
2. **Energy** (E = P × t / 1000) - Backend calculates ⭐ MOST IMPORTANT
3. **Carbon** (CO₂ = E × 0.82) - Backend calculates ⭐ CORE INNOVATION
4. **Carbon Rate** (Rate = P × 0.82) - Backend calculates
5. **Wastage** (Rule-based logic) - Backend detects
6. **Green Score** (100 - usage ratio) - Backend calculates

**All formulas are simple, accurate, and production-ready!**
