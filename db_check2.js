const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...vParts] = line.split('=');
  const v = vParts.join('=');
  if (k && v) acc[k.trim()] = v.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { error } = await supabase.rpc('apply_credits_to_order', { p_amount: 0 });
  if (error && error.message.includes('Could not find the function')) {
    console.log("RPC apply_credits_to_order does not exist!");
  } else {
    console.log("RPC apply_credits_to_order exists!", error);
  }

  // Also create promo_codes table just in case it doesn't exist
  // By executing a simple insert, we can test if it exists
  const { error: pErr } = await supabase.from('promo_codes').select('*').limit(1);
  if (pErr) console.log("promo_codes table missing or error:", pErr);
  else console.log("promo_codes table exists");
}
run();
