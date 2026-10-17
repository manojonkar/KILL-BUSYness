const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oictzdcrdqgwawezwjzr.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('user_unlocked_chapters').select('*').limit(1);
  console.log("user_unlocked_chapters:", data, error);
}

test();
