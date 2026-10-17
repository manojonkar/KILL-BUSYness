const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oictzdcrdqgwawezwjzr.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listUsers() {
  const { data: users } = await supabase.auth.admin.listUsers();
  users.users.forEach(u => console.log(u.email));
}
listUsers();
