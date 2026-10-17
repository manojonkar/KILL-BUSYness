const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oictzdcrdqgwawezwjzr.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing unlock_chapter with 1 param...");
  const { data: unlockData, error: unlockError } = await supabase.rpc("unlock_chapter", { p_chapter_id: 1 });
  console.log("unlock_chapter result:", unlockData, unlockError);
}

test();
