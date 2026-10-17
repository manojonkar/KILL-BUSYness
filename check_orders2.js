const fs = require('fs');
const { createClient } = require("@supabase/supabase-js");

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL')).split('=')[1].trim();
const key = env.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY')).split('=')[1].trim();

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from("book_orders")
    .select("id, name, email, created_at, notes")
    .ilike("notes", "%Manually granted%");
    
  if (error) {
    console.error(error);
    return;
  }
  
  const recent = data.filter(r => {
    const d = new Date(r.created_at);
    // looking for roughly last 48 hours
    return d > new Date(Date.now() - 48 * 60 * 60 * 1000);
  });
  
  console.log(JSON.stringify(recent, null, 2));
}

check();
