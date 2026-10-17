const { createClient } = require('@supabase/supabase-js');

const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
