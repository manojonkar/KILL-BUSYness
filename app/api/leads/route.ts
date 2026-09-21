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
    const existingUser = searchData?.users?.find((u: any) => u.email === data.email);
    
    const engagementUpdate = {
      ...data,
      is_lead: true,
      last_engaged_at: new Date().toISOString()
    };

    if (data.source === "masterclass") {
      engagementUpdate.masterclass_accessed = true;
    }

    if (existingUser) {
      await supabase.auth.admin.updateUserById(existingUser.id, { 
        user_metadata: { ...existingUser.user_metadata, ...engagementUpdate } 
      });
    } else {
      await supabase.auth.admin.createUser({
        email: data.email,
        password: Math.random().toString(36).slice(-10) + "A1!",
        email_confirm: true,
        user_metadata: {
          ...engagementUpdate,
          created_via: "progressive_gate"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
