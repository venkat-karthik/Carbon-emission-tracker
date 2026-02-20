/**
 * CSV Data Processor
 * Processes uploaded CSV files and updates the entire system
 */

import { iotManager, ESP32SensorPacket } from './iot-sensors';

export interface CSVRow {
  timestamp: string;
  zone: string;
  category: string;
  value: number;
  source: string;
  // Optional fields for energy data
  voltage?: number;
  current?: number;
  power?: number;
  energy?: number;
  temperature?: number;
  humidity?: number;
  occupancy?: number;
}

export interface ProcessedCSVData {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  categories: {
    energy: number;
    water: number;
    waste: number;
    transport: number;
  };
  dateRange: {
    start: Date;
    end: Date;
  };
  zones: string[];
  errors: string[];
}

class CSVProcessor {
  private uploadedData: CSVRow[] = [];
  private listeners: Set<(data: CSVRow[]) => void> = new Set();

  /**
   * Parse CSV file content
   */
  parseCSV(content: string): CSVRow[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required columns
    const requiredColumns = ['timestamp', 'zone', 'category', 'value', 'source'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Parse data rows
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        
        // Parse numeric fields
        if (['value', 'voltage', 'current', 'power', 'energy', 'temperature', 'humidity', 'occupancy'].includes(header)) {
          row[header] = parseFloat(value) || 0;
        } else {
          row[header] = value;
        }
      });

      rows.push(row as CSVRow);
    }

    return rows;
  }

  /**
   * Process CSV data and update IoT manager
   */
  processCSVData(csvContent: string): ProcessedCSVData {
    const rows = this.parseCSV(csvContent);
    
    const result: ProcessedCSVData = {
      totalRows: rows.length,
      validRows: 0,
      invalidRows: 0,
      categories: {
        energy: 0,
        water: 0,
        waste: 0,
        transport: 0,
      },
      dateRange: {
        start: new Date(),
        end: new Date(),
      },
      zones: [],
      errors: [],
    };

    const zones = new Set<string>();
    const timestamps: Date[] = [];

    rows.forEach((row, index) => {
      try {
        // Validate row
        if (!row.timestamp || !row.zone || !row.category || row.value === undefined) {
          result.invalidRows++;
          result.errors.push(`Row ${index + 2}: Missing required fields`);
          return;
        }

        // Parse timestamp
        const timestamp = new Date(row.timestamp);
        if (isNaN(timestamp.getTime())) {
          result.invalidRows++;
          result.errors.push(`Row ${index + 2}: Invalid timestamp format`);
          return;
        }

        timestamps.push(timestamp);
        zones.add(row.zone);

        // Count by category
        const category = row.category.toLowerCase();
        if (category in result.categories) {
          result.categories[category as keyof typeof result.categories]++;
        }

        // If this is energy data with full sensor info, process as ESP32 packet
        if (category === 'energy' && row.power !== undefined) {
          const packet: ESP32SensorPacket = {
            deviceId: `CSV_${row.zone.replace(/\s+/g, '_')}`,
            timestamp: Math.floor(timestamp.getTime() / 1000),
            voltage: row.voltage || 230,
            current: row.current || row.power / 230,
            power: row.power,
            energy: row.energy || 0,
            temperature: row.temperature || 25,
            humidity: row.humidity || 50,
            occupancy: row.occupancy !== undefined ? (row.occupancy as 0 | 1) : 1,
          };

          iotManager.processESP32Packet(packet);
        }

        result.validRows++;
      } catch (error) {
        result.invalidRows++;
        result.errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Store uploaded data
    this.uploadedData = rows.filter((_, index) => 
      !result.errors.some(err => err.startsWith(`Row ${index + 2}:`))
    );

    // Set date range
    if (timestamps.length > 0) {
      result.dateRange.start = new Date(Math.min(...timestamps.map(t => t.getTime())));
      result.dateRange.end = new Date(Math.max(...timestamps.map(t => t.getTime())));
    }

    result.zones = Array.from(zones);

    // Notify listeners
    this.notifyListeners();

    return result;
  }

  /**
   * Get uploaded data
   */
  getUploadedData(): CSVRow[] {
    return [...this.uploadedData];
  }

  /**
   * Get data by category
   */
  getDataByCategory(category: string): CSVRow[] {
    return this.uploadedData.filter(row => 
      row.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get data by zone
   */
  getDataByZone(zone: string): CSVRow[] {
    return this.uploadedData.filter(row => row.zone === zone);
  }

  /**
   * Get aggregated statistics
   */
  getStatistics() {
    const stats = {
      totalRecords: this.uploadedData.length,
      byCategory: {
        energy: 0,
        water: 0,
        waste: 0,
        transport: 0,
      },
      byZone: {} as Record<string, number>,
      averageValues: {
        energy: 0,
        water: 0,
        waste: 0,
        transport: 0,
      },
    };

    const categoryValues: Record<string, number[]> = {
      energy: [],
      water: [],
      waste: [],
      transport: [],
    };

    this.uploadedData.forEach(row => {
      const category = row.category.toLowerCase();
      
      if (category in stats.byCategory) {
        stats.byCategory[category as keyof typeof stats.byCategory]++;
        categoryValues[category].push(row.value);
      }

      stats.byZone[row.zone] = (stats.byZone[row.zone] || 0) + 1;
    });

    // Calculate averages
    Object.keys(categoryValues).forEach(category => {
      const values = categoryValues[category];
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        stats.averageValues[category as keyof typeof stats.averageValues] = 
          parseFloat((sum / values.length).toFixed(2));
      }
    });

    return stats;
  }

  /**
   * Calculate leaderboard scores based on uploaded data
   */
  calculateLeaderboard() {
    if (this.uploadedData.length === 0) {
      return {
        departments: [],
        hostels: [],
        blocks: [],
      };
    }

    // Group data by zone
    const zoneData: Record<string, {
      energy: number[];
      water: number[];
      waste: number[];
      transport: number[];
    }> = {};

    this.uploadedData.forEach(row => {
      if (!zoneData[row.zone]) {
        zoneData[row.zone] = {
          energy: [],
          water: [],
          waste: [],
          transport: [],
        };
      }

      const category = row.category.toLowerCase();
      if (category in zoneData[row.zone]) {
        zoneData[row.zone][category as keyof typeof zoneData[string]].push(row.value);
      }
    });

    // Calculate scores for each zone
    const zoneScores = Object.entries(zoneData).map(([zone, data]) => {
      // Calculate category scores (0-100)
      // Lower values are better for energy, water, waste
      // Higher values are better for transport (more sustainable trips)
      
      const energyAvg = data.energy.length > 0 
        ? data.energy.reduce((a, b) => a + b, 0) / data.energy.length 
        : 0;
      const waterAvg = data.water.length > 0 
        ? data.water.reduce((a, b) => a + b, 0) / data.water.length 
        : 0;
      const wasteAvg = data.waste.length > 0 
        ? data.waste.reduce((a, b) => a + b, 0) / data.waste.length 
        : 0;
      const transportAvg = data.transport.length > 0 
        ? data.transport.reduce((a, b) => a + b, 0) / data.transport.length 
        : 0;

      // Normalize scores (inverse for energy/water/waste, direct for transport)
      // Using arbitrary baselines for scoring
      const energyScore = Math.max(0, Math.min(100, 100 - (energyAvg / 200)));
      const waterScore = Math.max(0, Math.min(100, 100 - (waterAvg / 150)));
      const wasteScore = Math.max(0, Math.min(100, 100 - (wasteAvg / 100)));
      const transportScore = Math.max(0, Math.min(100, transportAvg * 5));

      // Overall score (weighted average)
      const overallScore = Math.round(
        (energyScore * 0.3 + waterScore * 0.25 + wasteScore * 0.25 + transportScore * 0.2)
      );

      return {
        zone,
        score: overallScore,
        energyScore: Math.round(energyScore),
        waterScore: Math.round(waterScore),
        wasteScore: Math.round(wasteScore),
        transportScore: Math.round(transportScore),
        dataPoints: data.energy.length + data.water.length + data.waste.length + data.transport.length,
      };
    });

    // Sort by score
    zoneScores.sort((a, b) => b.score - a.score);

    // Categorize zones
    const departments = zoneScores.filter(z => 
      z.zone.includes('Dept') || z.zone.includes('CSE') || z.zone.includes('Lab') || z.zone.includes('Library')
    );
    const hostels = zoneScores.filter(z => 
      z.zone.includes('Hostel') || z.zone.includes('Quarters')
    );
    const blocks = zoneScores.filter(z => 
      z.zone.includes('Block') || z.zone.includes('Campus')
    );

    // Format for leaderboard
    const formatLeaderboard = (zones: typeof zoneScores) => {
      return zones.map((z, index) => ({
        rank: index + 1,
        name: z.zone,
        score: z.score,
        change: Math.round((Math.random() - 0.3) * 5 * 10) / 10, // Simulated change
        badge: index === 0 ? "Most Improved" : null,
        trend: z.score > 70 ? "up" : "down",
        categoryScores: {
          energy: z.energyScore,
          water: z.waterScore,
          waste: z.wasteScore,
          transport: z.transportScore,
        },
      }));
    };

    return {
      departments: formatLeaderboard(departments),
      hostels: formatLeaderboard(hostels),
      blocks: formatLeaderboard(blocks),
    };
  }

  /**
   * Calculate overall campus green index score
   */
  calculateGreenIndex(): number {
    if (this.uploadedData.length === 0) {
      return 73; // Default score
    }

    const leaderboard = this.calculateLeaderboard();
    const allZones = [
      ...leaderboard.departments,
      ...leaderboard.hostels,
      ...leaderboard.blocks,
    ];

    if (allZones.length === 0) {
      return 73;
    }

    // Calculate weighted average of all zones
    const totalScore = allZones.reduce((sum, zone) => sum + zone.score, 0);
    return Math.round(totalScore / allZones.length);
  }

  /**
   * Get category scores for dashboard
   */
  getCategoryScores() {
    if (this.uploadedData.length === 0) {
      return null;
    }

    const leaderboard = this.calculateLeaderboard();
    const allZones = [
      ...leaderboard.departments,
      ...leaderboard.hostels,
      ...leaderboard.blocks,
    ];

    if (allZones.length === 0) {
      return null;
    }

    // Calculate average category scores across all zones
    const avgEnergy = Math.round(
      allZones.reduce((sum, z) => sum + (z.categoryScores?.energy || 0), 0) / allZones.length
    );
    const avgWater = Math.round(
      allZones.reduce((sum, z) => sum + (z.categoryScores?.water || 0), 0) / allZones.length
    );
    const avgWaste = Math.round(
      allZones.reduce((sum, z) => sum + (z.categoryScores?.waste || 0), 0) / allZones.length
    );
    const avgTransport = Math.round(
      allZones.reduce((sum, z) => sum + (z.categoryScores?.transport || 0), 0) / allZones.length
    );

    return {
      energy: avgEnergy,
      water: avgWater,
      waste: avgWaste,
      transport: avgTransport,
    };
  }

  /**
   * Subscribe to data updates
   */
  subscribe(callback: (data: CSVRow[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.uploadedData));
  }

  /**
   * Clear uploaded data
   */
  clearData() {
    this.uploadedData = [];
    this.notifyListeners();
  }

  /**
   * Export data to CSV
   */
  exportToCSV(): string {
    if (this.uploadedData.length === 0) {
      return '';
    }

    // Get all unique keys
    const keys = new Set<string>();
    this.uploadedData.forEach(row => {
      Object.keys(row).forEach(key => keys.add(key));
    });

    const headers = Array.from(keys);
    const csvLines = [headers.join(',')];

    this.uploadedData.forEach(row => {
      const values = headers.map(header => {
        const value = (row as any)[header];
        return value !== undefined ? value : '';
      });
      csvLines.push(values.join(','));
    });

    return csvLines.join('\n');
  }
}

// Singleton instance
export const csvProcessor = new CSVProcessor();

// Example CSV format
export const CSV_EXAMPLE = `timestamp,zone,category,value,source,voltage,current,power,energy,temperature,humidity,occupancy
2026-02-20T10:00:00Z,Block A,energy,12500,PZEM-004T,230,54.3,12500,0.125,28,60,1
2026-02-20T10:00:00Z,Block B,energy,18300,PZEM-004T,228,80.3,18300,0.183,29,62,1
2026-02-20T10:00:00Z,Hostel Zone,water,145,Flow Sensor,,,,,,,
2026-02-20T10:00:00Z,Main Campus,waste,65,Manual,,,,,,,
2026-02-20T10:00:00Z,Parking,transport,12,Manual,,,,,,,`;

export default csvProcessor;
