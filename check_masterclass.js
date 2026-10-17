const { createClient } = require("@supabase/supabase-js");

const url = "https://oictzdcrdqgwawezwjzr.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function checkMasterclass() {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });
  
  if (error) {
    console.error(error);
    return;
  }

  const users = data.users || [];
  let invitedCount = 0;
  let accessedCount = 0;

  users.forEach(u => {
    const meta = u.user_metadata || {};
    if (meta.is_masterclass_invitee) {
      invitedCount++;
      if (meta.masterclass_accessed) {
        accessedCount++;
      }
    }
  });

  console.log(`Total users invited to Masterclass: ${invitedCount}`);
  console.log(`Total users who have ACCESSED/watched it: ${accessedCount}`);
}

checkMasterclass();
