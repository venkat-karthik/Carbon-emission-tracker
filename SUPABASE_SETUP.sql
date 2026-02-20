-- Run this script in your Supabase SQL Editor to create the table

CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  voltage DECIMAL(6,2),
  current DECIMAL(6,2),
  power DECIMAL(8,2),
  energy DECIMAL(10,3),
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  occupancy SMALLINT CHECK (occupancy IN (0, 1)),
  carbon_rate DECIMAL(8,3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster dashboard queries
CREATE INDEX idx_device_timestamp ON sensor_readings(device_id, timestamp DESC);
