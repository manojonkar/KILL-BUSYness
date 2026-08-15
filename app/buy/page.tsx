import Link from "next/link";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { FORMATS, getSettings } from "@/lib/book";
import { placeOrder, submitTransactionId } from "./actions";
import OrderForm from "./OrderForm";

const ORDER = ["ebook", "paperback", "hardcover"];

export default async function BuyPage({
  searchParams
}: {
  searchParams: { format?: string; error?: string; ref?: string; paid?: string };
}) {
  const supabase = createClient();
  const settings = await getSettings(supabase);
  const selectedKey = searchParams?.format && FORMATS[searchParams.format] ? searchParams.format : "paperback";
  const fmt = FORMATS[selectedKey];
  const upi = settings.upi_id || "";
  const payee = settings.upi_payee || "Management Innovations";
  const amazon = settings.amazon_url || "";
  const upiReady = upi && !upi.startsWith("REPLACE_");

  let orderAmount = fmt.price;
  if (searchParams?.ref) {
    const { data: orderData } = await supabase
      .from("book_orders")
      .select("amount")
      .eq("ref", searchParams.ref)
      .single();
    if (orderData) {
      orderAmount = orderData.amount;
    }
  }

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
            <h3 style={{ marginBottom: 12, color: "var(--teal-ink, #0f766e)" }}>✔ Payment Details Submitted</h3>
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
            <h2>Almost there — one payment to go.</h2>
            <p>Your order reference is <strong>{searchParams.ref}</strong>. We&apos;ve emailed you a copy.</p>
          </div>
          <div className="card" style={{ padding: 30, maxWidth: 620 }}>
            <h3 style={{ marginBottom: 10 }}>Pay ₹{orderAmount.toLocaleString("en-IN")} by UPI</h3>
            {upiReady ? (
              <>
                <p style={{ fontSize: ".9rem", color: "var(--ink-soft)", marginBottom: 14 }}>
                  Scan the QR below, or send the amount to the UPI ID shown.
                </p>
                <div className="card" style={{ padding: 18, marginBottom: 16, background: "var(--surface-2)", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ background: "#fff", padding: 10, borderRadius: 8, flex: "0 0 auto" }}>
                    <img
                      src={`/img/upi-qr-${fmt.key}`}
                      alt={`Scan to pay Rs ${orderAmount} by UPI`}
                      width={168}
                      height={168}
                      style={{ display: "block", width: 168, height: 168 }}
                    />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <div style={{ fontSize: ".72rem", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-faint)", marginBottom: 6 }}>
                      Scan with any UPI app
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "1rem", fontWeight: 700, wordBreak: "break-all" }}>{upi}</div>
                    <div style={{ fontSize: ".8rem", color: "var(--ink-soft)", marginTop: 4 }}>{payee}</div>
                    <div style={{ fontSize: ".8rem", color: "var(--ink-soft)", marginTop: 8 }}>
                      The QR already carries the amount, ₹{orderAmount.toLocaleString("en-IN")}.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ fontSize: ".9rem", color: "#9B2226", marginBottom: 14 }}>
                Payment details are being set up. We will email you the payment instructions shortly.
              </p>
            )}
            <p style={{ fontSize: ".9rem", marginBottom: 8 }}>
              <strong>Important:</strong> put <strong>{searchParams.ref}</strong> in the payment note so we can match your
              payment to your order.
            </p>
            <p style={{ fontSize: ".86rem", color: "var(--ink-soft)", marginBottom: 20 }}>
              {fmt.physical
                ? "Once payment is confirmed we courier your copy to the address you gave."
                : "Once payment is confirmed we email the eBook to the address you gave."}
            </p>

            {/* Form to submit UPI Transaction ID / UTR */}
            <form action={submitTransactionId} style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <input type="hidden" name="ref" value={searchParams.ref} />
              <input type="hidden" name="format" value={fmt.key} />
              <label style={{ display: "block", fontSize: ".84rem", fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                Enter UPI Transaction ID / Ref No. / UTR (optional)
              </label>
              <p style={{ fontSize: ".76rem", color: "var(--ink-soft)", marginBottom: 12 }}>
                Pasting the transaction ID from your UPI app helps us verify your payment much faster.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input 
                  name="utr" 
                  placeholder="e.g. 12-digit UPI Ref / UTR number"
                  style={{ 
                    flex: "1 1 240px", 
                    padding: "8px 12px", 
                    borderRadius: 6, 
                    border: "1px solid var(--line, #e2e8f0)",
                    fontSize: ".88rem"
                  }}
                />
                <button className="btn btn-teal" type="submit">
                  I have paid
                </button>
              </div>
            </form>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Buy the book</span>
          <h2>KILL BUSYness</h2>
          <p>Choose your format, then fill in where it should go.</p>
        </div>

        <div className="grid cols-3" style={{ marginBottom: 26 }}>
          {ORDER.map((k) => {
            const f = FORMATS[k];
            const on = k === selectedKey;
            return (
              <Link
                key={k}
                href={`/buy?format=${k}`}
                className="card mini-card"
                style={{
                  cursor: "pointer",
                  borderColor: on ? "var(--teal)" : "var(--line)",
                  borderWidth: on ? 2 : 1,
                  borderStyle: "solid"
                }}
              >
                <span className="eyebrow" style={{ color: on ? "var(--teal-ink)" : "var(--ink-faint)" }}>
                  {on ? "Selected" : "Choose"}
                </span>
                <h3 style={{ fontSize: "1.1rem" }}>{f.label}</h3>
                <p style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  ₹{f.price.toLocaleString("en-IN")}
                </p>
                <p>{f.blurb}</p>
              </Link>
            );
          })}
        </div>

        {searchParams?.error ? (
          <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{searchParams.error}</p>
        ) : null}

        <div className="card" style={{ padding: 30, maxWidth: 720 }}>
          <h3 style={{ marginBottom: 4 }}>Your details — {fmt.label}</h3>
          <p style={{ color: "var(--ink-soft)", fontSize: ".85rem", marginBottom: 20 }}>
            ₹{fmt.price.toLocaleString("en-IN")} · {fmt.blurb}
          </p>
          <OrderForm fmt={fmt} placeOrder={placeOrder} />
        </div>

        {amazon ? (
          <p style={{ fontSize: ".85rem", color: "var(--ink-soft)", marginTop: 20 }}>
            Outside India?{" "}
            <a href={amazon} target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>
              Buy on Amazon
            </a>
            .
          </p>
        ) : null}
      </main>
    </>
  );
}
