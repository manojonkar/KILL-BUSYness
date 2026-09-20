import Header from "@/components/Header";
import LoginForm from "./LoginForm";

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
          <LoginForm initialError={searchParams?.error} />
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
