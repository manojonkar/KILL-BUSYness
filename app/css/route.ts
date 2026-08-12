import zlib from "node:zlib";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("brand_assets").select("b64").eq("name", "app-css-v1").maybeSingle();
    if (!data?.b64) return new Response("/* unavailable */", { status: 503, headers: { "Content-Type": "text/css" } });
    const css = zlib.gunzipSync(Buffer.from(data.b64, "base64")).toString("utf8");
    return new Response(css, {
      headers: { "Content-Type": "text/css; charset=utf-8", "Cache-Control": "public, max-age=604800" }
    });
  } catch {
    return new Response("/* unavailable */", { status: 503, headers: { "Content-Type": "text/css" } });
  }
}
