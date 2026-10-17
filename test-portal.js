const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:/KILL BUSYness Website/Rebuild/rebuild/source/.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testReset() {
  const { data, error } = await supabase.auth.resetPasswordForEmail('test_portal@example.com');
  console.log("Error:", error);
}

testReset();
