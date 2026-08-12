import Header from "@/components/Header";

export default function PrivacyPage() {
  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Privacy</span>
          <h2>Privacy &amp; data handling</h2>
          <p>What this portal collects, why, and what we never do with it. Last updated 7 August 2026.</p>
        </div>

        <div className="card" style={{ padding: "30px 32px", maxWidth: 820 }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Who we are</h3>
          <p className="body-text" style={{ marginBottom: 22 }}>
            This portal is operated by Management Innovations, founded by Manoj Onkar, as part of the KILL BUSYness
            Organization Audit programme. For any question about your data, write to{" "}
            <a href="mailto:manoj@managementinnovations.co.in" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>manoj@managementinnovations.co.in</a>.
          </p>

          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>What we collect</h3>
          <p className="body-text" style={{ marginBottom: 10 }}>
            <strong>If you hold an account:</strong> your name, email address, and a securely hashed password. We never
            see or store your password in readable form. We also record your reading progress, the private reflections
            you choose to save, your XP, MI Currency balance and any rewards you redeem.
          </p>
          <p className="body-text" style={{ marginBottom: 10 }}>
            <strong>If your organization runs an audit:</strong> the company name, industry and size, plus the name,
            email and role of each person invited to take part.
          </p>
          <p className="body-text" style={{ marginBottom: 22 }}>
            <strong>If you complete a survey:</strong> your answers to the 40 questions. You do not need an account to
            take a survey — your unique link is all that is required.
          </p>

          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>How survey answers are used</h3>
          <p className="body-text" style={{ marginBottom: 22 }}>
            This is the part that matters most. Your organization&apos;s administrator sees the <strong>aggregate</strong>{" "}
            report — scores by dimension and by question, averaged across everyone who responded. The portal does not
            show them a breakdown of who answered what. Be aware, though, of a limit that is simple arithmetic rather
            than policy: if very few people respond, an average can be revealing. We recommend running the audit with
            enough participants that individual answers cannot reasonably be inferred.
          </p>

          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Your private reflections</h3>
          <p className="body-text" style={{ marginBottom: 22 }}>
            The notes you save against a chapter are visible only to you. They are not shared with your employer, your
            organization&apos;s administrator, or anyone else, and they never appear in any report.
          </p>

          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>What we never do</h3>
          <p className="body-text" style={{ marginBottom: 22 }}>
            We do not sell your data. We do not share it with advertisers. We do not expose one organization&apos;s
            confidential results to another — cross-company comparison, where shown, is anonymised percentile only.
          </p>

          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Who processes it</h3>
          <p className="body-text" style={{ marginBottom: 22 }}>
            Data is stored with Supabase (Postgres, protected by row-level security), the site is hosted on Vercel, and
            transactional email is sent through Resend. These providers process data on our behalf and do not use it for
            their own purposes.
          </p>

          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>How long we keep it</h3>
          <p className="body-text" style={{ marginBottom: 22 }}>
            We keep your account and audit data for as long as your account is active, or as long as your organization
            needs the audit history. Ask us to delete it and we will, subject to any legal obligation to retain records.
          </p>

          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Your rights</h3>
          <p className="body-text" style={{ marginBottom: 22 }}>
            You may ask for a copy of the personal data we hold about you, ask us to correct it, or ask us to erase it.
            Under India&apos;s Digital Personal Data Protection Act you may also withdraw consent you previously gave —
            for example, consent to publish a story you submitted. Email the address above and we will respond.
          </p>

          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Cookies</h3>
          <p className="body-text" style={{ marginBottom: 0 }}>
            The portal sets only the cookies required to keep you signed in. There is no advertising or third-party
            tracking on this site.
          </p>
        </div>
      </main>
    </>
  );
}
