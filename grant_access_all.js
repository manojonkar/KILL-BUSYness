const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oictzdcrdqgwawezwjzr.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function grantAccess() {
  const emails = ['mmmanoj@gmail.com', 'manoj@managementinnovations.co.in'];
  for (const email of emails) {
    const { data, error } = await supabase.from('book_orders').insert({ name: 'Manoj', phone: '0000', email: email, format: 'audiobook', amount: 999, status: 'paid' }).select();
    if (error) console.error(error);
    else console.log('Successfully granted audiobook access to:', email);
  }
}
grantAccess();
