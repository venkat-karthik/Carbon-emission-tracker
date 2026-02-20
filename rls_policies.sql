-- Enable public read access for sensors table
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on sensors" ON public.sensors FOR SELECT USING (true);

-- Enable public read access for alerts table
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on alerts" ON public.alerts FOR SELECT USING (true);

-- Also ensure sensor_readings can be read and inserted
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on sensor_readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users on sensor_readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);
