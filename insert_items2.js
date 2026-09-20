const { createClient } = require('@supabase/supabase-js');
const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA";
const supabase = createClient(url, key);

async function run() {
  const items = [];
  items.push({ item: 'Full AudioBook', cost: 1000, requires_audit: false, active: true, sort_order: 200 });

  for (let i = 0; i <= 10; i++) {
    const chNum = i === 0 ? "INTRO" : i.toString().padStart(2, "0");
    items.push({ item: `Audio Chapter ${chNum}`, cost: 100, requires_audit: false, active: true, sort_order: 200 + i + 1 });
  }

  const { error } = await supabase.from('store_items').upsert(items, { onConflict: 'item' });
  if (error) console.error(error);
  else console.log('Successfully inserted store items');
}
run();
