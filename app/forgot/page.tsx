import Header from "@/components/Header";
import { requestReset } from "./actions";

export default function ForgotPage({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Account recovery</span>
          <h2>Reset your password</h2>
          <p>Enter the email you registered with and we&apos;ll send you a link to set a new password.</p>
        </div>
        <div className="card" style={{ padding: 30, maxWidth: 440 }}>
          {searchParams?.error ? <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{searchParams.error}</p> : null}
          {searchParams?.sent ? (
            <p style={{ color: "#154D34", fontSize: ".88rem" }}>
              If an account exists for that address, a reset link is on its way. It expires in one hour. Check your spam folder if it doesn&apos;t arrive within a few minutes.
            </p>
          ) : (
            <form action={requestReset}>
              <div className="field" style={{ marginBottom: 18 }}>
                <label>Email</label>
                <input name="email" type="email" required placeholder="you@company.com" />
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>Send reset link</button>
            </form>
          )}
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: 16 }}>
            <a href="/login" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>Back to log in</a>
          </p>
        </div>
      </main>
    </>
  );
}
