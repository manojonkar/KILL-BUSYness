import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: { name: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from("brand_assets")
    .select("mime, b64")
    .eq("name", params.name)
    .maybeSingle();

  if (!data?.b64) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(data.b64, "base64"), {
    headers: {
      "Content-Type": data.mime,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
