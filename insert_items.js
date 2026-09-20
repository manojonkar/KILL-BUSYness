const fs = require('fs');
const env = fs.readFileSync('.env.development.local', 'utf8').split('\n').reduce((acc, line) => {
  const i = line.indexOf('=');
  if (i > 0) {
    const k = line.substring(0, i).trim();
    let v = line.substring(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length - 1);
    acc[k] = v;
  }
  return acc;
}, {});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

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
