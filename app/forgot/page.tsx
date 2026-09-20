import Header from "@/components/Header";
import ForgotForm from "./ForgotForm";

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
          <ForgotForm initialError={searchParams?.error} />
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: 16 }}>
            <a href="/login" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>Back to log in</a>
          </p>
        </div>
      </main>
    </>
  );
}
