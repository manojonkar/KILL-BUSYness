const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://oictzdcrdqgwawezwjzr.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STATE_FILE = 'C:\\KILL BUSYness Website\\Portal_Live_Data\\campaign_state.json';

async function backfill() {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  const sentUsers = Object.values(state.users).filter(u => u.phase1_sent_at);
  
  const { data: searchData } = await supabase.auth.admin.listUsers();
  
  for (const user of sentUsers) {
    const existingUser = searchData?.users?.find((u) => u.email === user.email);
    const updates = { 
      name: user.name, 
      is_masterclass_invitee: true,
      masterclass_accessed: false,
      invited_at: new Date(user.phase1_sent_at).toISOString()
    };

    if (!existingUser) {
      await supabase.auth.admin.createUser({
        email: user.email,
        password: Math.random().toString(36).slice(-10) + "A1!", 
        email_confirm: true,
        user_metadata: updates
      });
      console.log(`Created missing user ${user.email}`);
    } else {
      await supabase.auth.admin.updateUserById(existingUser.id, {
        user_metadata: { ...existingUser.user_metadata, ...updates }
      });
      console.log(`Updated missing user ${user.email}`);
    }
  }
}

backfill();
