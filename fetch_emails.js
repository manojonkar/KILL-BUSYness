const { createClient } = require('@supabase/supabase-js');
const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA";
const supabase = createClient(url, key);

async function run() {
  const [b, p, a] = await Promise.all([
    supabase.from('book_orders').select('email'),
    supabase.from('participants').select('email'),
    supabase.auth.admin.listUsers() // to get registered users
  ]);
  
  const emails = new Set();
  
  if (b.data) b.data.forEach(x => { if (x.email) emails.add(x.email.toLowerCase().trim()); });
  if (p.data) p.data.forEach(x => { if (x.email) emails.add(x.email.toLowerCase().trim()); });
  if (a.data && a.data.users) a.data.users.forEach(x => { if (x.email) emails.add(x.email.toLowerCase().trim()); });
  
  console.log('Total unique emails:', emails.size);
  console.log(Array.from(emails).join(', '));
}
run();
