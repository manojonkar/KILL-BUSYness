const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oictzdcrdqgwawezwjzr.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function grantAccess() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const manoj = users.users.find(u => u.email === 'manojonkar@gmail.com');
  
  if(!manoj) { console.log('User manojonkar@gmail.com not found!'); return; }
  
  const { data, error } = await supabase.from('book_purchases').upsert({ email: manoj.email, format: 'audiobook', updated_at: new Date() }).select();
  if (error) console.error(error);
  else console.log('Successfully granted audiobook access to:', manoj.email);
}
grantAccess();
