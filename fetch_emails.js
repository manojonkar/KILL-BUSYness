const { createClient } = require('@supabase/supabase-js');
const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
