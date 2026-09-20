const { createClient } = require('@supabase/supabase-js');

const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA";
const supabase = createClient(url, key);

async function addStoreItem() {
  const { data, error } = await supabase.from('store_items').insert({
    item: 'Synopsis of KILL BUSYness (PDF)',
    cost: 0,
    requires_audit: false,
    sort_order: 1,
    active: true
  });
  if (error) console.error(error);
  else console.log('Added store item!');
}

addStoreItem();
