import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atkcqrktyfkghdxkfmwo.supabase.co';
const supabaseKey = 'sb_publishable_77A8BAkzdRzwZgtSjdPaFQ_ibp4m-_V';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const { error: sErr } = await supabase.from('sensors').upsert([
        { id: 'LAB1_NODE1', name: 'ESP32 IoT Node 1', zone: 'Block B', category: 'Energy', status: 'active' },
        { id: 'S001', name: 'Block B Main Meter', zone: 'Block B', category: 'Energy', status: 'active' },
        { id: 'S002', name: 'Hostel Zone Water', zone: 'Hostel Zone', category: 'Water', status: 'active' },
        { id: 'S003', name: 'Lab Block Flow', zone: 'Block A', category: 'Water', status: 'active' },
        { id: 'S004', name: 'Solar Inverter 1', zone: 'Main Campus', category: 'Energy', status: 'active' },
        { id: 'S005', name: 'Waste Bin Scale A', zone: 'Hostel Zone', category: 'Waste', status: 'active' },
        { id: 'S006', name: 'EV Charger Bay', zone: 'Main Campus', category: 'Transport', status: 'active' },
        { id: 'S007', name: 'CSE Dept Panel', zone: 'CSE Dept', category: 'Energy', status: 'active' },
        { id: 'S008', name: 'Canteen Water', zone: 'Main Campus', category: 'Water', status: 'faulty' }
    ]);
    console.log('Sensors Seeded:', sErr ? sErr.message : 'Success');

    const { error: aErr } = await supabase.from('alerts').upsert([
        { zone: 'Block B', category: 'Energy', severity: 'high', message: 'Consumption spike: 3.2x baseline', status: 'open' },
        { zone: 'Hostel Zone', category: 'Waste', severity: 'high', message: 'Segregation compliance dropped below 20%', status: 'open' },
        { zone: 'Block A', category: 'Water', severity: 'medium', message: 'Overnight flow anomaly detected', status: 'open' },
        { zone: 'CSE Dept', category: 'Energy', severity: 'low', message: 'Standby consumption after hours', status: 'closed' }
    ]);
    console.log('Alerts Seeded:', aErr ? aErr.message : 'Success');
}

seed();
