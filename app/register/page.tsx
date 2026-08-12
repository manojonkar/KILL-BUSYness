import Header from "@/components/Header";
import { registerAccount } from "./actions";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Get started</span>
          <h2>Create your account</h2>
          <p>One account gives you the book, your reading journey, XP and badges, and the Organization Audit for your company.</p>
        </div>
        <div className="card" style={{ padding: 30, maxWidth: 440 }}>
          {searchParams?.error ? (
            <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{searchParams.error}</p>
          ) : null}
          <form action={registerAccount}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Full Name</label>
              <input name="name" required placeholder="Your name" />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Email</label>
              <input name="email" type="email" required placeholder="you@company.com" />
            </div>
            <div className="field" style={{ marginBottom: 18 }}>
              <label>Password</label>
              <input name="password" type="password" required minLength={6} placeholder="At least 6 characters" />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
              Create Account
            </button>
          </form>
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: 16 }}>
            Already have an account? <a href="/login" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>Log in</a>
          </p>
        </div>
      </main>
    </>
  );
}
