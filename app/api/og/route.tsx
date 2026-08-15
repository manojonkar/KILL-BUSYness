import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Optional params we could pass, like company name or specific dimension
    const company = searchParams.get("company") || "A visionary organization";
    
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f172a",
            backgroundImage: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)",
            color: "#fff",
            fontFamily: "sans-serif",
            padding: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 24,
              padding: "40px 80px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <h1
              style={{
                fontSize: 80,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                margin: 0,
                color: "#0E9C74",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              I AM KILLING
              <br />
              BUSYness
            </h1>
            <p
              style={{
                fontSize: 32,
                color: "#cbd5e1",
                marginTop: 30,
                fontWeight: 500,
                textAlign: "center",
                maxWidth: 800,
                lineHeight: 1.4,
              }}
            >
              We just completed our organizational health audit and committed to a 90-day sprint. No more chaos, just execution.
            </p>
            <div style={{ display: "flex", alignItems: "center", marginTop: 50, gap: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                killbusyness.com
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response("Failed to generate image", { status: 500 });
  }
}
