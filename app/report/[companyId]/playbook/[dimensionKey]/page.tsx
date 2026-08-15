import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/dimensions";
import { DIMENSION_INSIGHTS, SPRINT_CONTENT } from "@/lib/insights";
import PrintPlaybookButton from "@/components/PrintPlaybookButton";

export default async function PlaybookPage({
  params,
}: {
  params: { companyId: string; dimensionKey: string };
}) {
  const supabase = createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", params.companyId)
    .single();

  if (!company) notFound();

  const dimension = DIMENSIONS.find((d) => d.key === params.dimensionKey);
  if (!dimension) notFound();

  const sprint = SPRINT_CONTENT[dimension.key];
  const insight = DIMENSION_INSIGHTS[dimension.key]?.low; // Use the "low" insight for the playbook, as they are generating it for a weak area

  if (!sprint || !insight) notFound();

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px 20px", color: "#0f172a" }}>
      {/* Hide this on print */}
      <div className="no-print" style={{ maxWidth: 800, margin: "0 auto 24px", display: "flex", justifyContent: "flex-end" }}>
        <PrintPlaybookButton />
      </div>

      <div 
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "#fff",
          padding: "60px 80px",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          borderTop: "8px solid #0E9C74"
        }}
        className="playbook-print"
      >
        <header style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: 32, marginBottom: 40 }}>
          <div style={{ fontSize: "1rem", textTransform: "uppercase", letterSpacing: ".1em", color: "#64748b", fontWeight: 700, marginBottom: 12 }}>
            Intervention Playbook
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-.02em", color: "#0f172a", marginBottom: 16, lineHeight: 1.1 }}>
            Killing BUSYness in<br/><span style={{ color: "#0E9C74" }}>{dimension.label}</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#475569", margin: 0 }}>
            Prepared for <strong>{company.name}</strong>
          </p>
        </header>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>The Diagnosis</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155", marginBottom: 8 }}>What it means</h3>
              <p style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>
                {insight.whatItMeans}
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155", marginBottom: 8 }}>The Symptoms</h3>
              <p style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.7, margin: 0, paddingLeft: 16, borderLeft: "4px solid #cbd5e1" }}>
                {insight.symptom}
              </p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>The 90-Day Execution Plan</h2>
          <p style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.7, marginBottom: 32 }}>
            Do not try to fix everything at once. This 3-month sequence is designed to build momentum incrementally. Assign an owner to each month and hold them accountable.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ background: "#f8fafc", padding: 24, borderRadius: 8, borderLeft: "4px solid #0E9C74" }}>
              <div style={{ fontSize: ".85rem", textTransform: "uppercase", letterSpacing: ".1em", color: "#0E9C74", fontWeight: 800, marginBottom: 8 }}>Month 1: The Reset</div>
              <p style={{ fontSize: "1.1rem", color: "#0f172a", lineHeight: 1.6, margin: 0 }}>{sprint.month1}</p>
            </div>
            
            <div style={{ background: "#f8fafc", padding: 24, borderRadius: 8, borderLeft: "4px solid #D9A441" }}>
              <div style={{ fontSize: ".85rem", textTransform: "uppercase", letterSpacing: ".1em", color: "#D9A441", fontWeight: 800, marginBottom: 8 }}>Month 2: The Reprogramming</div>
              <p style={{ fontSize: "1.1rem", color: "#0f172a", lineHeight: 1.6, margin: 0 }}>{sprint.month2}</p>
            </div>

            <div style={{ background: "#f8fafc", padding: 24, borderRadius: 8, borderLeft: "4px solid #64748b" }}>
              <div style={{ fontSize: ".85rem", textTransform: "uppercase", letterSpacing: ".1em", color: "#64748b", fontWeight: 800, marginBottom: 8 }}>Month 3: The Measurement</div>
              <p style={{ fontSize: "1.1rem", color: "#0f172a", lineHeight: 1.6, margin: 0 }}>{sprint.month3}</p>
            </div>
          </div>
        </section>

        <section>
          <div style={{ background: "#0f172a", color: "#fff", padding: 32, borderRadius: 12, textAlign: "center" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>Required Reading</h2>
            <p style={{ fontSize: "1rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
              Before starting Month 1, ensure your executive team has read and discussed:<br/>
              <strong style={{ color: "#0E9C74", fontSize: "1.1rem", display: "inline-block", marginTop: 8 }}>{sprint.reread}</strong>
            </p>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .playbook-print { 
            box-shadow: none !important; 
            padding: 0 !important; 
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}} />
    </div>
  );
}
