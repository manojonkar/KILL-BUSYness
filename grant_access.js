const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oictzdcrdqgwawezwjzr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA');

async function grantAccess() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const manoj = users.users.find(u => u.email === 'manojonkar@gmail.com');
  
  if(!manoj) { console.log('User manojonkar@gmail.com not found!'); return; }
  
  const { data, error } = await supabase.from('book_purchases').upsert({ email: manoj.email, format: 'audiobook', updated_at: new Date() }).select();
  if (error) console.error(error);
  else console.log('Successfully granted audiobook access to:', manoj.email);
}
grantAccess();
