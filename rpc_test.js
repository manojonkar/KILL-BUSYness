const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oictzdcrdqgwawezwjzr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing unlock_chapter...");
  const { data: unlockData, error: unlockError } = await supabase.rpc("unlock_chapter", { p_chapter_id: 1, p_cost: 100 });
  console.log("unlock_chapter result:", unlockData, unlockError);

  console.log("Testing redeem_item...");
  const { data: redeemData, error: redeemError } = await supabase.rpc("redeem_item", { p_item: "test_item" });
  console.log("redeem_item result:", redeemData, redeemError);
}

test();
