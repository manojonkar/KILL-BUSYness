const { createClient } = require("@supabase/supabase-js");
const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA";

const supabase = createClient(url, key);

async function checkRLS() {
  const { data, error } = await supabase.rpc("get_policies_book_orders"); // I don't have this RPC. 
  // Wait, I can query pg_policies!
  const { data: d2, error: e2 } = await supabase.from("pg_policies").select("*").eq("tablename", "book_orders");
  console.log("Policies:", d2, e2);
}

checkRLS();
