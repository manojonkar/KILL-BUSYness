import Link from "next/link";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { FORMATS, getSettings } from "@/lib/book";
import { placeOrder } from "./actions";

const ORDER = ["ebook", "paperback", "hardcover"];

export default async function BuyPage({
  searchParams
}: {
  searchParams: { format?: string; error?: string; ref?: string };
}) {
  const supabase = createClient();
  const settings = await getSettings(supabase);
  const selectedKey = searchParams?.format && FORMATS[searchParams.format] ? searchParams.format : "paperback";
  const fmt = FORMATS[selectedKey];
  const upi = settings.upi_id || "";
  const payee = settings.upi_payee || "Management Innovations";
  const amazon = settings.amazon_url || "";
  const upiReady = upi && !upi.startsWith("REPLACE_");

  if (searchParams?.ref) {
    return (
      <>
        <Header active="" />
        <main>
          <div className="section-head">
            <span className="eyebrow">Order placed</span>
            <h2>Almost there — one payment to go.</h2>
            <p>Your order reference is <strong>{searchParams.ref}</strong>. We&apos;ve emailed you a copy.</p>
          </div>
          <div className="card" style={{ padding: 30, maxWidth: 620 }}>
            <h3 style={{ marginBottom: 10 }}>Pay ₹{fmt.price.toLocaleString("en-IN")} by UPI</h3>
            {upiReady ? (
              <>
                <p style={{ fontSize: ".9rem", color: "var(--ink-soft)", marginBottom: 14 }}>
                  Scan the QR below, or send the amount to the UPI ID shown.
                </p>
                <div className="card" style={{ padding: 18, marginBottom: 16, background: "var(--surface-2)", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ background: "#fff", padding: 10, borderRadius: 8, flex: "0 0 auto" }}>
                    <img
                      src={`/img/upi-qr-${fmt.key}`}
                      alt={`Scan to pay Rs ${fmt.price} by UPI`}
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
                      The QR already carries the amount, ₹{fmt.price.toLocaleString("en-IN")}.
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
            <p style={{ fontSize: ".86rem", color: "var(--ink-soft)" }}>
              {fmt.physical
                ? "Once payment is confirmed we courier your copy to the address you gave."
                : "Once payment is confirmed we email the eBook to the address you gave."}
            </p>
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
          <form action={placeOrder} className="form-grid">
            <input type="hidden" name="format" value={fmt.key} />
            <div className="field">
              <label>Your Name</label>
              <input name="name" placeholder="Full name" required />
            </div>
            <div className="field">
              <label>Company</label>
              <input name="company" placeholder="Company name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="you@company.com" required />
            </div>
            <div className="field">
              <label>Contact Number</label>
              <input name="phone" type="tel" placeholder="+91 98765 43210" required />
            </div>
            {fmt.physical ? (
              <>
                <div className="field full">
                  <label>Delivery Address</label>
                  <textarea name="address" rows={3} placeholder="Flat / building / street" required />
                </div>
                <div className="field">
                  <label>City</label>
                  <input name="city" placeholder="City" required />
                </div>
                <div className="field">
                  <label>State</label>
                  <input name="state" placeholder="State" />
                </div>
                <div className="field">
                  <label>PIN Code</label>
                  <input name="pincode" placeholder="400001" required />
                </div>
              </>
            ) : null}
            <p style={{ gridColumn: "1/-1", fontSize: ".78rem", color: "var(--ink-faint)", marginTop: 8 }}>
              Your details are used only to fulfil this order. Payment is by UPI on the next screen.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 12, gridColumn: "1/-1" }} type="submit">
              Place Order — ₹{fmt.price.toLocaleString("en-IN")}
            </button>
          </form>
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
