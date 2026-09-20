const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAccess() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const manoj = users.users.find(u => u.email === 'manojonkar@gmail.com');
  
  if(!manoj) { console.log('Manoj not found'); return; }
  console.log('Manoj ID:', manoj.id);
  
  const { data: purchases } = await supabase.from('book_purchases').select('*').eq('email', manoj.email);
  console.log('Purchases:', purchases);
  
  // Just give full access to be safe
  await supabase.from('book_purchases').upsert({ email: manoj.email, format: 'audiobook', updated_at: new Date() });
  console.log('Granted audiobook access to manojonkar@gmail.com!');
}
checkAccess();
