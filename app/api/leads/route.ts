import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const supabase = createAdminClient();
    
    if (!data.email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const { data: searchData } = await supabase.auth.admin.listUsers();
    let existingUser = searchData?.users?.find((u: any) => u.email === data.email);
    
    const engagementUpdate: any = {
      ...data,
      is_lead: true,
      last_engaged_at: new Date().toISOString()
    };

    if (data.source === "masterclass") {
      engagementUpdate.masterclass_accessed = true;
    }

    // Prepare to track distinct VSL unlocks
    let unlocked = [];
    if (existingUser) {
      unlocked = existingUser.user_metadata?.unlocked_vsls || [];
    }
    
    const videoId = String(data.source);
    const isNewVsl = videoId && !unlocked.includes(videoId);

    if (isNewVsl) {
      unlocked.push(videoId);
      engagementUpdate.unlocked_vsls = unlocked;
    }

    let targetUserId = "";

    if (existingUser) {
      targetUserId = existingUser.id;
      await supabase.auth.admin.updateUserById(targetUserId, { 
        user_metadata: { ...existingUser.user_metadata, ...engagementUpdate } 
      });
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: data.email,
        password: Math.random().toString(36).slice(-10) + "A1!",
        email_confirm: true,
        user_metadata: {
          ...engagementUpdate,
          created_via: "progressive_gate"
        }
      });
      if (createErr) throw createErr;
      targetUserId = newUser.user.id;
    }

    // Award 100 MI Credits if they unlocked a new VSL/Masterclass
    if (isNewVsl) {
      const { data: prog } = await supabase
        .from("user_progress")
        .select("xp, wallet")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (prog) {
        await supabase.from("user_progress").update({
          xp: (prog.xp || 0) + 100,
          wallet: (prog.wallet || 0) + 100
        }).eq("user_id", targetUserId);
      } else {
        await supabase.from("user_progress").insert({
          user_id: targetUserId,
          xp: 100,
          wallet: 100,
          streak: 1
        });
      }
    }

    return NextResponse.json({ success: true, awarded: isNewVsl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
