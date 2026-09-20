const { createClient } = require('@supabase/supabase-js');
const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA";
const supabase = createClient(url, key);

async function run() {
  const { data } = await supabase.from('user_progress').select('*').limit(1);
  console.log(data ? Object.keys(data[0] || {}) : 'no data');
}
run();
