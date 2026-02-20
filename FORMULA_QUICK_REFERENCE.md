# Formula Quick Reference Card

## 🎯 6 Formulas You Need to Know

### 1️⃣ Power (Sensor Calculates)
```
P(W) = V × I
```
- **Example**: 230V × 1.5A = 345W
- **Who calculates**: PZEM-004T sensor
- **You receive**: Power value directly

---

### 2️⃣ Energy (MOST IMPORTANT)
```
Energy(kWh) = [Power(W) × Time(hours)] / 1000
```
- **Example**: (400W × 2h) / 1000 = 0.8 kWh
- **Who calculates**: Backend
- **Used for**: Billing, reports, analytics

---

### 3️⃣ Carbon (CORE INNOVATION)
```
CO₂(kg) = Energy(kWh) × 0.82
```
- **Example**: 5 kWh × 0.82 = 4.1 kg CO₂
- **Who calculates**: Backend
- **Why it matters**: Emotional connection, climate impact

---

### 4️⃣ Carbon Rate (Real-Time)
```
Carbon Rate(kg/hr) = Power(kW) × 0.82
```
- **Example**: 0.4 kW × 0.82 = 0.328 kg CO₂/hour
- **Who calculates**: Backend
- **Why it matters**: Live impact visualization

---

### 5️⃣ Wastage Detection (Rule-Based)
```
IF occupancy == 0 AND power > 150W AND duration > 10min
  → WASTAGE
```
- **Example**: Empty room, 800W, 15 minutes = WASTAGE!
- **Who calculates**: Backend
- **Why it matters**: Actionable alerts, cost savings

---

### 6️⃣ Green Score (Efficiency)
```
Score = 100 - [(Energy Used / Max Expected) × 100]
```
- **Example**: 100 - [(80 / 100) × 100] = 20
- **Who calculates**: Backend
- **Why it matters**: Gamification, leaderboards

---

## 📊 Constants Used

```typescript
EMISSION_FACTOR_INDIA = 0.82    // kg CO₂ per kWh
ELECTRICITY_RATE_INR = 8.5      // ₹ per kWh
WATER_RATE_INR = 0.24           // ₹ per liter
WASTE_DISPOSAL_RATE_INR = 4.5   // ₹ per kg
FUEL_RATE_INR = 90              // ₹ per liter
```

---

## 🔄 Data Flow

```
ESP32/PZEM → Backend → Calculations → Database → Frontend
   (P=V×I)    (E,CO₂)   (Wastage)    (Store)    (Display)
```

---

## 💻 Code Examples

### Calculate Energy
```typescript
const energy = iotManager.calculateEnergy(12500, 24);
// Result: 300 kWh
```

### Calculate Carbon
```typescript
const carbon = iotManager.calculateCarbon(300);
// Result: 246 kg CO₂
```

### Detect Wastage
```typescript
const wastage = iotManager.detectWastage('sensor-1', 800, 0, 15);
// Result: true (wastage detected!)
```

### Get Campus Metrics
```typescript
const metrics = iotManager.getTotalCampusMetrics();
// Returns: realTime, daily, monthly metrics
```

---

## 🎤 Hackathon Demo Lines

1. **"Our system uses 6 industry-standard formulas..."**
2. **"Energy = Power × Time / 1000 - simple but powerful"**
3. **"We convert everything to carbon - 246 kg CO₂ per day"**
4. **"That's like driving a car for 984 km!"**
5. **"Wastage detection saves ₹1,700 per month"**
6. **"No machine learning needed - rule-based intelligence"**

---

## ✅ Implementation Checklist

- [x] All formulas in `src/lib/iot-sensors.ts`
- [x] Real-time calculations working
- [x] UI component displaying metrics
- [x] Wastage alerts generating
- [x] Carbon emissions calculated
- [x] Cost analysis included
- [x] Monthly projections shown
- [x] Zero TypeScript errors
- [x] Documentation complete
- [x] Ready for demo!

---

## 📁 Key Files

1. **`src/lib/iot-sensors.ts`** - All formulas
2. **`src/components/dashboard/EnergyMetrics.tsx`** - Display
3. **`FORMULAS_DOCUMENTATION.md`** - Full explanations
4. **`FORMULAS_IMPLEMENTATION_GUIDE.md`** - How-to guide

---

## 🏆 What Makes This Special

1. ✨ **Carbon Focus** - Not just energy monitoring
2. ✨ **Real-Time** - Updates every 5 seconds
3. ✨ **Transparent** - Formulas shown to users
4. ✨ **Actionable** - Wastage detection with cost impact
5. ✨ **Simple** - No complex ML, just smart rules
6. ✨ **Production-Ready** - Clean code, zero errors

---

## 🚀 Quick Start

```bash
# Start the server
npm run dev

# Open browser
http://localhost:3001

# See real-time metrics on dashboard
# All formulas calculating automatically!
```

---

**Print this card and keep it handy during your hackathon demo! 📋**
