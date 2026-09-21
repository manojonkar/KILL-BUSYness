import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const supabase = createAdminClient();
    
    if (!data.email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Try to find existing user
    const { data: searchData, error: searchError } = await supabase.auth.admin.listUsers();
    let existingUser = null;
    
    if (searchData && searchData.users) {
      existingUser = searchData.users.find((u: any) => u.email === data.email);
    }

    if (existingUser) {
      // Update existing user metadata with new lead info
      const newMetadata = { ...existingUser.user_metadata, ...data, is_lead: true };
      await supabase.auth.admin.updateUserById(existingUser.id, { user_metadata: newMetadata });
    } else {
      // Create new lead user in auth.users
      await supabase.auth.admin.createUser({
        email: data.email,
        password: Math.random().toString(36).slice(-10) + "A1!", // Random secure password
        email_confirm: true,
        user_metadata: {
          ...data,
          is_lead: true,
          created_via: "progressive_gate"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Lead save error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
