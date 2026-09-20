import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from('gamification_progress').select('*');
  console.log("Gamification progress:", data);
  const { data: up } = await supabase.from('user_progress').select('*');
  console.log("User progress:", up);
}

check();
