require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function checkAccess() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  const manoj = users.users.find(u => u.email === 'manojonkar@gmail.com');
  if(!manoj) { console.log('Manoj not found'); return; }
  
  const { data: purchases } = await supabase.from('book_purchases').select('*').eq('email', manoj.email);
  console.log('Purchases:', purchases);
  
  const { data: gamification } = await supabase.from('user_gamification').select('*').eq('user_id', manoj.id);
  console.log('Gamification:', gamification);
}
checkAccess();
