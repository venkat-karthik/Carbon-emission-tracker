-- Step 1: Create sensors table
CREATE TABLE IF NOT EXISTS sensors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'offline', 'faulty')),
    last_ping TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert reference sensors (matching the mock data initially)
INSERT INTO sensors (id, name, zone, category, status) VALUES
('LAB1_NODE1', 'ESP32 IoT Node 1', 'Block B', 'Energy', 'active'),
('S001', 'Block B Main Meter', 'Block B', 'Energy', 'active'),
('S002', 'Hostel Zone Water', 'Hostel Zone', 'Water', 'active'),
('S003', 'Lab Block Flow', 'Block A', 'Water', 'active'),
('S004', 'Solar Inverter 1', 'Main Campus', 'Energy', 'active'),
('S005', 'Waste Bin Scale A', 'Hostel Zone', 'Waste', 'active'),
('S006', 'EV Charger Bay', 'Main Campus', 'Transport', 'active'),
('S007', 'CSE Dept Panel', 'CSE Dept', 'Energy', 'active'),
('S008', 'Canteen Water', 'Main Campus', 'Water', 'faulty')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    cause TEXT,
    rule_triggered VARCHAR(255),
    evidence TEXT,
    suggested_action TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Insert some mock alerts for testing until the background jobs are built
INSERT INTO alerts (zone, category, severity, message, status) VALUES
('Block B', 'Energy', 'high', 'Consumption spike: 3.2x baseline', 'open'),
('Hostel Zone', 'Waste', 'high', 'Segregation compliance dropped below 20%', 'open'),
('Block A', 'Water', 'medium', 'Overnight flow anomaly detected', 'open'),
('CSE Dept', 'Energy', 'low', 'Standby consumption after hours', 'closed');

-- Step 3: Create tracking for Decarbonization Actions (optional for later but good to have)
CREATE TABLE IF NOT EXISTS sustainability_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    impact_points DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'suggested' CHECK (status IN ('suggested', 'planned', 'in_progress', 'completed')),
    assigned_to VARCHAR(100),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
