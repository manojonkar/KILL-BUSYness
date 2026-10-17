const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oictzdcrdqgwawezwjzr.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
