import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oictzdcrdqgwawezwjzr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.log("No key found.");
  process.exit(1);
}

const s = createClient(supabaseUrl, supabaseKey);
s.from('store_items').select('*').then(d => console.log(JSON.stringify(d.data, null, 2)));
