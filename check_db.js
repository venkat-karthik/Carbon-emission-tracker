import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atkcqrktyfkghdxkfmwo.supabase.co';
const supabaseKey = 'sb_publishable_77A8BAkzdRzwZgtSjdPaFQ_ibp4m-_V';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: sensors, error: sErr } = await supabase.from('sensors').select('*').limit(1);
    console.log('Sensors Table:', sErr ? sErr.message : sensors);

    const { data: readings, error: rErr } = await supabase.from('sensor_readings').select('*').limit(1);
    console.log('Sensor Readings Table:', rErr ? rErr.message : readings);
}

check();
