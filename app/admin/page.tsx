import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

type Tab = "orders" | "companies" | "surveys";

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  // Check admin authorization
  const { data: isAdmin } = await supabase.rpc("is_site_admin");
  if (!isAdmin) redirect("/dashboard");

  const adminClient = createAdminClient();
  const currentTab = (searchParams.tab || "orders") as Tab;

  // Fetch all data for stats and active tabs
  const [
    { data: orders },
    { data: companies },
    { data: participants }
  ] = await Promise.all([
    adminClient
      .from("book_orders")
      .select("*")
      .order("created_at", { ascending: false }),
    adminClient
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false }),
    adminClient
      .from("participants")
      .select("*, companies(name)")
      .order("created_at", { ascending: false })
  ]);

  const allOrders = orders || [];
  const allCompanies = companies || [];
  const allParticipants = participants || [];

  // 1. Compute summary stats
  const totalSalesCount = allOrders.length;
  const paidOrders = allOrders.filter(o => o.status === "paid" || o.status === "dispatched");
  const totalPaidRevenue = paidOrders.reduce((acc, o) => acc + o.amount, 0);
  const totalBookVolume = allOrders.reduce((acc, o) => {
    // Extract quantity from notes (e.g. "Quantity: 12 ...")
    const match = o.notes?.match(/Quantity:\s*(\d+)/i);
    const qty = match ? parseInt(match[1], 10) : 1;
    return acc + qty;
  }, 0);

  const totalCompanies = allCompanies.length;
  const totalSurveysCompleted = allParticipants.filter(p => p.status === "completed").length;

  return (
    <>
      <Header active="" />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>
        
        {/* Page Head */}
        <div className="section-head" style={{ marginBottom: 30 }}>
          <span className="eyebrow">Administration</span>
          <h2>Master Dashboard</h2>
          <p>Real-time metrics, book order fulfillments, and audit statistics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid cols-4" style={{ marginBottom: 34, gap: 16 }}>
          <div className="card mini-card" style={{ padding: "20px 24px" }}>
            <span className="eyebrow" style={{ color: "var(--ink-soft)" }}>Paid Revenue</span>
            <h3 style={{ fontSize: "1.8rem", margin: "6px 0 2px", color: "var(--teal-ink, #0f766e)" }}>
              ₹{totalPaidRevenue.toLocaleString("en-IN")}
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>From {paidOrders.length} paid orders</p>
          </div>
          <div className="card mini-card" style={{ padding: "20px 24px" }}>
            <span className="eyebrow" style={{ color: "var(--ink-soft)" }}>Total Books Ordered</span>
            <h3 style={{ fontSize: "1.8rem", margin: "6px 0 2px" }}>
              {totalBookVolume} <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--ink-soft)" }}>copies</span>
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>Across {totalSalesCount} placed orders</p>
          </div>
          <div className="card mini-card" style={{ padding: "20px 24px" }}>
            <span className="eyebrow" style={{ color: "var(--ink-soft)" }}>Registered Companies</span>
            <h3 style={{ fontSize: "1.8rem", margin: "6px 0 2px" }}>{totalCompanies}</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>Audits created by organizations</p>
          </div>
          <div className="card mini-card" style={{ padding: "20px 24px" }}>
            <span className="eyebrow" style={{ color: "var(--ink-soft)" }}>Surveys Completed</span>
            <h3 style={{ fontSize: "1.8rem", margin: "6px 0 2px" }}>
              {totalSurveysCompleted} <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--ink-soft)" }}>/ {allParticipants.length}</span>
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>Individual survey completion rate</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 24, gap: 14 }}>
          <Link
            href="/admin?tab=orders"
            style={{
              padding: "10px 18px 8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
              color: currentTab === "orders" ? "var(--teal-ink, #0f766e)" : "var(--ink-soft)",
              borderBottom: currentTab === "orders" ? "3px solid var(--teal)" : "3px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            📋 Book Orders ({allOrders.length})
          </Link>
          <Link
            href="/admin?tab=companies"
            style={{
              padding: "10px 18px 8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
              color: currentTab === "companies" ? "var(--teal-ink, #0f766e)" : "var(--ink-soft)",
              borderBottom: currentTab === "companies" ? "3px solid var(--teal)" : "3px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            🏢 Registered Companies ({allCompanies.length})
          </Link>
          <Link
            href="/admin?tab=surveys"
            style={{
              padding: "10px 18px 8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
              color: currentTab === "surveys" ? "var(--teal-ink, #0f766e)" : "var(--ink-soft)",
              borderBottom: currentTab === "surveys" ? "3px solid var(--teal)" : "3px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            📊 Survey completions ({allParticipants.length})
          </Link>
        </div>

        {/* Active Tab View */}
        <div className="card" style={{ padding: 24, overflowX: "auto" }}>
          
          {/* TAB: Book Orders */}
          {currentTab === "orders" && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Orders Record</h3>
              {allOrders.length === 0 ? (
                <p style={{ color: "var(--ink-faint)", fontSize: "0.9rem" }}>No orders placed yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--line)", background: "#f8fafc" }}>
                      <th style={{ padding: 12 }}>Ref</th>
                      <th style={{ padding: 12 }}>Date</th>
                      <th style={{ padding: 12 }}>Customer</th>
                      <th style={{ padding: 12 }}>Format</th>
                      <th style={{ padding: 12 }}>Order Amount</th>
                      <th style={{ padding: 12 }}>Quantity / Notes</th>
                      <th style={{ padding: 12, textAlign: "center" }}>Status Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((o) => {
                      const date = new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      });
                      
                      const match = o.notes?.match(/Quantity:\s*(\d+)/i);
                      const qty = match ? match[1] : "1";
                      const cleanNotes = o.notes?.replace(/Quantity:\s*\d+/i, "").replace(/^,\s*/, "") || "—";

                      return (
                        <tr key={o.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: 12, fontFamily: "monospace", fontWeight: 700, fontSize: "0.9rem" }}>
                            {o.ref}
                          </td>
                          <td style={{ padding: 12, color: "var(--ink-soft)" }}>{date}</td>
                          <td style={{ padding: 12 }}>
                            <strong>{o.name}</strong>
                            {o.company && <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>{o.company}</div>}
                            <div style={{ fontSize: "0.76rem", color: "var(--ink-faint)" }}>{o.email} · {o.phone}</div>
                            {o.address && (
                              <div style={{ fontSize: "0.74rem", color: "var(--ink-soft)", marginTop: 4, fontStyle: "italic", whiteSpace: "pre-line", maxWidth: 220 }}>
                                {o.address}, {o.city}{o.state ? `, ${o.state}` : ""} {o.pincode}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: 12, textTransform: "capitalize" }}>{o.format}</td>
                          <td style={{ padding: 12, fontWeight: 700 }}>₹{o.amount.toLocaleString("en-IN")}</td>
                          <td style={{ padding: 12 }}>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>Qty: {qty}</span>
                            <div style={{ fontSize: "0.76rem", color: "var(--ink-soft)", marginTop: 2 }}>{cleanNotes}</div>
                          </td>
                          <td style={{ padding: 12, textAlign: "center" }}>
                            <form action={updateOrderStatus} style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                              <input type="hidden" name="orderId" value={o.id} />
                              <select 
                                name="status" 
                                defaultValue={o.status}
                                style={{ 
                                  fontSize: "0.8rem", 
                                  padding: "4px 8px", 
                                  borderRadius: 6, 
                                  border: "1px solid var(--line)",
                                  backgroundColor: o.status === "paid" ? "#ccfbf1" : o.status === "dispatched" ? "#dbeafe" : o.status === "cancelled" ? "#fee2e2" : "#fef3c7",
                                  color: o.status === "paid" ? "#0f766e" : o.status === "dispatched" ? "#1d4ed8" : o.status === "cancelled" ? "#991b1b" : "#d97706",
                                  fontWeight: 700
                                }}
                              >
                                <option value="awaiting_payment">Awaiting Payment</option>
                                <option value="paid">Paid</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button 
                                type="submit" 
                                className="btn btn-dark btn-sm" 
                                style={{ 
                                  padding: "5px 10px", 
                                  fontSize: "0.74rem", 
                                  borderRadius: 6 
                                }}
                              >
                                Save
                              </button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB: Registered Companies */}
          {currentTab === "companies" && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Companies Directory</h3>
              {allCompanies.length === 0 ? (
                <p style={{ color: "var(--ink-faint)", fontSize: "0.9rem" }}>No companies registered yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--line)", background: "#f8fafc" }}>
                      <th style={{ padding: 12 }}>Company Name</th>
                      <th style={{ padding: 12 }}>Admin Contact</th>
                      <th style={{ padding: 12 }}>Industry</th>
                      <th style={{ padding: 12 }}>Size</th>
                      <th style={{ padding: 12, textAlign: "center" }}>Invited Seats</th>
                      <th style={{ padding: 12, textAlign: "center" }}>Completions</th>
                      <th style={{ padding: 12 }}>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCompanies.map((c) => {
                      const regDate = new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      });

                      // Calculate completion metrics for this company
                      const companyParticipants = allParticipants.filter(p => p.company_id === c.id);
                      const completions = companyParticipants.filter(p => p.status === "completed").length;

                      return (
                        <tr key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: 12, fontWeight: "bold", color: "var(--ink)" }}>{c.name}</td>
                          <td style={{ padding: 12 }}>
                            {c.admin_name || "—"}
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>{c.admin_email || "—"}</div>
                          </td>
                          <td style={{ padding: 12 }}>{c.industry || "—"}</td>
                          <td style={{ padding: 12 }}>{c.size || "—"}</td>
                          <td style={{ padding: 12, textAlign: "center", fontWeight: "bold" }}>{c.seats || 10}</td>
                          <td style={{ padding: 12, textAlign: "center" }}>
                            <span style={{ 
                              padding: "2px 8px", 
                              borderRadius: "4px", 
                              fontWeight: "bold",
                              backgroundColor: completions > 0 ? "#ccfbf1" : "#f1f5f9",
                              color: completions > 0 ? "#0f766e" : "#475569"
                            }}>
                              {completions} completed
                            </span>
                          </td>
                          <td style={{ padding: 12, color: "var(--ink-soft)" }}>{regDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB: Survey Completions */}
          {currentTab === "surveys" && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Survey completions status</h3>
              {allParticipants.length === 0 ? (
                <p style={{ color: "var(--ink-faint)", fontSize: "0.9rem" }}>No participants invited yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--line)", background: "#f8fafc" }}>
                      <th style={{ padding: 12 }}>Respondent</th>
                      <th style={{ padding: 12 }}>Company</th>
                      <th style={{ padding: 12 }}>Organizational Level</th>
                      <th style={{ padding: 12, textAlign: "center" }}>Status</th>
                      <th style={{ padding: 12 }}>Completed Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allParticipants.map((p: any) => {
                      const completedTime = p.completed_at 
                        ? new Date(p.completed_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "—";

                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: 12 }}>
                            <strong>{p.name || "Anonymous"}</strong>
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>{p.email}</div>
                          </td>
                          <td style={{ padding: 12 }}>{p.companies?.name || "—"}</td>
                          <td style={{ padding: 12, textTransform: "capitalize" }}>{p.level}</td>
                          <td style={{ padding: 12, textAlign: "center" }}>
                            <span style={{ 
                              padding: "2px 6px", 
                              borderRadius: "4px", 
                              fontWeight: "bold",
                              fontSize: "0.75rem",
                              backgroundColor: p.status === "completed" ? "#ccfbf1" : "#fef3c7",
                              color: p.status === "completed" ? "#0f766e" : "#b45309"
                            }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: 12, color: "var(--ink-soft)" }}>{completedTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  );
}
