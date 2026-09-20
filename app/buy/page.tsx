import Link from "next/link";
import Header from "@/components/Header";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { FORMATS, getSettings } from "@/lib/book";
import { getProgress } from "@/lib/gamification";
import { placeOrder, submitTransactionId } from "./actions";
import OrderForm from "./OrderForm";

const ORDER = ["ebook", "paperback", "audiobook"];

export default async function BuyPage({
  searchParams
}: {
  searchParams: { format?: string; error?: string; ref?: string; paid?: string; intl?: string };
}) {
  const supabase = createClient();
  const settings = await getSettings(supabase);
  const selectedKey = searchParams?.format && FORMATS[searchParams.format] ? searchParams.format : "paperback";
  const fmt = FORMATS[selectedKey];
  const upi = settings.upi_id || "";
  const payee = settings.upi_payee || "Management Innovations";
  const upiReady = upi && !upi.startsWith("REPLACE_");

  const { data: { user } } = await supabase.auth.getUser();
  let wallet = 0;
  if (user) {
    const progress = await getProgress(supabase, user.id);
    wallet = progress.wallet;
  }

  let orderAmount = fmt.price;
  if (searchParams?.ref) {
    const adminSupabase = createAdminClient();
    const { data: orderData } = await adminSupabase
      .from("book_orders")
      .select("amount")
      .eq("ref", searchParams.ref)
      .single();
    if (orderData) {
      orderAmount = orderData.amount;
    }
  }

  const amazon = settings.amazon_url || "";
  const upiUrl = `upi://pay?pa=${upi}&pn=${encodeURIComponent(payee)}&am=${orderAmount}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(upiUrl)}`;

  const isIntl = searchParams?.intl === "true";

  // Thank You page after they pay through UPI QR Code
  if (searchParams?.ref && searchParams.paid === "true") {
    return (
      <>
        <Header active="" />
        <main>
          <div className="section-head">
            <span className="eyebrow">Order Placed</span>
            <h2>Thank you for your payment.</h2>
            <p>Your order reference is <strong>{searchParams.ref}</strong>.</p>
          </div>
          <div className="card" style={{ padding: 30, maxWidth: 620 }}>
            <h3 style={{ marginBottom: 12, color: "var(--teal-ink, #0f766e)" }}>&#10004; Payment Details Submitted</h3>
            <p style={{ fontSize: ".92rem", color: "var(--ink-soft)", marginBottom: 18 }}>
              We have recorded your payment status for reference <strong>{searchParams.ref}</strong>.
            </p>
            <p style={{ fontSize: ".92rem", color: "var(--ink-soft)", marginBottom: 18 }}>
              Please check your email inbox (and spam folder) for the confirmatory email containing your order summary. Once we confirm the transaction with our bank, your order status will be updated.
            </p>
            <p style={{ fontSize: ".86rem", color: "var(--ink-faint)", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              {fmt.physical
                ? "Once payment is verified, your book will be couriered to the address you provided."
                : "Once payment is verified, the eBook copy will be emailed to your address."}
            </p>
            <div style={{ marginTop: 24 }}>
              <Link href="/home" className="btn btn-dark btn-sm">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // QR Code payment details page
  if (searchParams?.ref) {
    return (
      <>
        <Header active="" />
        <main>
          <div className="section-head">
            <span className="eyebrow">Order Placed</span>
            <h2>Almost there &mdash; one payment to go.</h2>
            <p>Your order reference is <strong>{searchParams.ref}</strong>. We&apos;ve emailed you a copy.</p>
          </div>
          <div className="card" style={{ padding: 30, maxWidth: 840 }}>
            <div className="mobile-stack" style={{ alignItems: "stretch", gap: 32 }}>
              
              {/* Indian Buyers */}
              {!isIntl && (
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>Indian Buyers</h3>
                  <p style={{ fontWeight: 600, color: "var(--teal-ink)", marginBottom: 12 }}>Pay Rs. {orderAmount.toLocaleString("en-IN")}</p>
                  {upiReady ? (
                    <>
                      <p style={{ fontSize: ".9rem", color: "var(--ink-soft)", marginBottom: 14 }}>
                        Scan the QR below, or send the amount to the UPI ID shown.
                      </p>
                      <div className="card" style={{ padding: 18, marginBottom: 16, background: "var(--surface-2)", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ background: "#fff", padding: 10, borderRadius: 8, flex: "0 0 auto" }}>
                          <img
                            src={qrUrl}
                            alt={`Scan to pay Rs ${orderAmount} by UPI`}
                            width={168}
                            height={168}
                            style={{ display: "block", width: 168, height: 168 }}
                          />
                        </div>
                        <div style={{ flex: "1 1 120px" }}>
                          <div style={{ fontSize: ".72rem", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-faint)", marginBottom: 6 }}>
                            Scan with any UPI app
                          </div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: "1rem", fontWeight: 700, wordBreak: "break-all" }}>{upi}</div>
                          <div style={{ fontSize: ".8rem", color: "var(--ink-soft)", marginTop: 4 }}>{payee}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: ".9rem", color: "#9B2226", marginBottom: 14 }}>
                      Payment details are being set up. We will email you the payment instructions shortly.
                    </p>
                  )}
                </div>
              )}

              {/* International Buyers */}
              {(isIntl || !searchParams?.ref) && (
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>International Payments</h3>
                  
                  <div style={{ padding: "20px 0" }}>
                    {isIntl && (
                      <p style={{ fontWeight: 600, color: "var(--teal-ink)", marginBottom: 16, fontSize: "1.1rem" }}>
                        Pay US$ {orderAmount}
                      </p>
                    )}
                    <a 
                      href="https://rzp.io/rzp/KILLBUSYness" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ display: "block", textAlign: "center", marginBottom: 20 }}
                    >
                      Pay Now
                    </a>
                    
                    <p style={{ fontSize: ".9rem", color: "var(--ink)", lineHeight: 1.5 }}>
                      If you face any difficulty, write to WhatsApp: <strong>91-9106456275</strong>
                    </p>
                  </div>
                </div>
              )}

            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <p style={{ fontSize: ".9rem", marginBottom: 8 }}>
                <strong>Important:</strong> Please put <strong>{searchParams.ref}</strong> in your payment note or reply email so we can match your payment to your order.
              </p>
              
              <form action={submitTransactionId} style={{ marginTop: 24, padding: 20, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <input type="hidden" name="ref" value={searchParams.ref} />
              <input type="hidden" name="format" value={selectedKey} />
              <h4 style={{ marginBottom: 8 }}>I have paid!</h4>
              <p style={{ fontSize: ".85rem", color: "var(--ink-soft)", marginBottom: 16 }}>
                Submit your UTR (Transaction Reference) number below so we can verify it quickly.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <input type="text" name="utr" placeholder="Enter UTR Number" required style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary">Submit UTR</button>
              </div>
            </form>
            </div>
          </div>
        </main>
      </>
    );
  }

  // The actual Buy Form
  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head" style={{ marginBottom: 40 }}>
          <span className="eyebrow">Buy Now</span>
          <h2>Ready to Kill BUSYness?</h2>
          <p>You&apos;re ordering the <strong>{fmt.label}</strong>.</p>
        </div>

        <div className="mobile-stack" style={{ gap: 32, alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {ORDER.map((k) => (
                <Link
                  key={k}
                  href={`/buy?format=${k}`}
                  className={`btn btn-sm ${k === selectedKey ? "btn-dark" : "btn-outline"}`}
                >
                  {FORMATS[k].label}
                </Link>
              ))}
            </div>

            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 8, fontSize: "1.4rem" }}>{fmt.label}</h3>
              <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--teal-ink)", marginBottom: 16 }}>
                Rs. {fmt.price.toLocaleString("en-IN")}
                {fmt.usdPrice && <span style={{ color: "var(--ink-soft)", fontSize: "1rem", marginLeft: 12, fontWeight: 500 }}>| US$ {fmt.usdPrice}</span>}
              </p>
              <p style={{ color: "var(--ink-soft)" }}>{fmt.blurb}</p>
              {fmt.physical && amazon && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                  <p style={{ fontSize: ".9rem", color: "var(--ink-soft)", margin: 0 }}>
                    <em>* Also available on Amazon.</em>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="card" style={{ padding: "30px 24px" }}>
            <h3 style={{ marginBottom: 20, fontSize: "1.2rem", borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
              Delivery Details
            </h3>
            <OrderForm fmt={fmt} placeOrder={placeOrder} wallet={wallet} />
          </div>
        </div>
      </main>
    </>
  );
}
