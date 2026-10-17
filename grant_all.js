const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oictzdcrdqgwawezwjzr.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function grantAccess() {
  const emails = ['manojonkar@gmail.com', 'manoj@managementinnovations.co.in', 'mmmanoj@gmail.com', 'manoj@killbusyness.com'];
  for (const email of emails) {
    const { data, error } = await supabase.from('book_orders').insert({ 
      ref: 'ADMIN-' + Math.floor(Math.random()*10000),
      name: 'Admin', 
      phone: '0000', 
      email: email, 
      format: 'audiobook', 
      amount: 0, 
      unit_price: 0,
      quantity: 1,
      status: 'paid' 
    }).select();
    if (error) console.error(error);
    else console.log('Successfully granted audiobook access to:', email);
  }
}
grantAccess();
