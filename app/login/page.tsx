import Header from "@/components/Header";
import LoginForm from "./LoginForm";

export default function LoginPage({ searchParams }: { searchParams: { error?: string, message?: string } }) {
  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Instant Access</span>
          <h2>Access the KILL BUSYness Portal</h2>
          <p>Read the book, listen to all chapters, and run your Organization Audit smoothly with zero password friction.</p>
        </div>
        <div className="card" style={{ padding: 30, maxWidth: 440, margin: "0 auto" }}>
          <LoginForm initialError={searchParams?.error} initialMessage={searchParams?.message} />
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: 16, textAlign: "center" }}>
            Unrestricted access enabled for all executive modules, chapters, and audio.
          </p>
        </div>
      </main>
    </>
  );
}
