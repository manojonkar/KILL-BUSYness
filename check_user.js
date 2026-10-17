const { createClient } = require("@supabase/supabase-js");

const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from("book_orders").select("*").ilike("email", "%manoj%");
  if (error) { console.error(error); return; }
  console.log("Found book orders for manoj:");
  console.table(data.map(d => ({ email: d.email, format: d.format, status: d.status, notes: d.notes })));
  
  const { data: d2, error: e2 } = await supabase.from("book_orders").select("*").ilike("email", "%onkar%");
  if (e2) { console.error(e2); return; }
  console.log("Found book orders for onkar:");
  console.table(d2.map(d => ({ email: d.email, format: d.format, status: d.status, notes: d.notes })));
}

check();
