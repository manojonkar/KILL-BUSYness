import Header from "@/components/Header";
import { login } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Welcome back</span>
          <h2>Log in to your portal</h2>
          <p>Pick up your reading streak, XP, and Organization Audit right where you left off.</p>
        </div>
        <div className="card" style={{ padding: 30, maxWidth: 440 }}>
          {searchParams?.error ? (
            <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{searchParams.error}</p>
          ) : null}
          <form action={login}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Email</label>
              <input name="email" type="email" required placeholder="you@company.com" />
            </div>
            <div className="field" style={{ marginBottom: 18 }}>
              <label>Password</label>
              <input name="password" type="password" required placeholder="••••••••" />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
              Log In
            </button>
          </form>
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: 12 }}>
            <a href="/forgot" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>Forgot your password?</a>
          </p>
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: 8 }}>
            New here? <a href="/register" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>Register your organization</a>
          </p>
        </div>
      </main>
    </>
  );
}
