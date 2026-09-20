const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oictzdcrdqgwawezwjzr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA');

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
