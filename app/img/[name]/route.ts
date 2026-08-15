import { createClient } from "@/lib/supabase/server";
import fs from "node:fs";
import path from "node:path";

export async function GET(_req: Request, { params }: { params: { name: string } }) {
  // Check for local static file override first to guarantee quality and avoid DB network overhead
  const webpPath = path.join(process.cwd(), "public", "img", `${params.name}.webp`);
  if (fs.existsSync(webpPath)) {
    const buf = fs.readFileSync(webpPath);
    return new Response(buf, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }

  const pngPath = path.join(process.cwd(), "public", "img", `${params.name}.png`);
  if (fs.existsSync(pngPath)) {
    const buf = fs.readFileSync(pngPath);
    return new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }

  const jpgPath = path.join(process.cwd(), "public", "img", `${params.name}.jpg`);
  if (fs.existsSync(jpgPath)) {
    const buf = fs.readFileSync(jpgPath);
    return new Response(buf, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }

  const jpegPath = path.join(process.cwd(), "public", "img", `${params.name}.jpeg`);
  if (fs.existsSync(jpegPath)) {
    const buf = fs.readFileSync(jpegPath);
    return new Response(buf, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }

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
