import { NextResponse } from "next/server";
import { coreGrantSingleAccess } from "@/app/admin/grant-access/actions";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    // Simple basic auth for local/cron scripts using the service role key as a secret
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, formats } = body;

    if (!email || !formats || !Array.isArray(formats)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Call the exact same core function the Admin Dashboard UI uses, but with the elevated client!
    const adminClient = createAdminClient();
    const result = await coreGrantSingleAccess(adminClient, name, email, formats);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
