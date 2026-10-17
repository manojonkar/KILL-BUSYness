const { createClient } = require('@supabase/supabase-js');
const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function run() {
  const { data } = await supabase.from('user_progress').select('*').limit(1);
  console.log(data ? Object.keys(data[0] || {}) : 'no data');
}
run();
