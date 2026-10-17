const { createClient } = require("@supabase/supabase-js");
const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, key);

async function checkRLS() {
  const { data, error } = await supabase.rpc("get_policies_book_orders"); // I don't have this RPC. 
  // Wait, I can query pg_policies!
  const { data: d2, error: e2 } = await supabase.from("pg_policies").select("*").eq("tablename", "book_orders");
  console.log("Policies:", d2, e2);
}

checkRLS();
