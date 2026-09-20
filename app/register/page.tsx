import Header from "@/components/Header";
import RegisterForm from "./RegisterForm";

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
          <RegisterForm initialError={searchParams?.error} />
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: 16 }}>
            Already have an account? <a href="/login" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>Log in</a>
          </p>
        </div>
      </main>
    </>
  );
}
