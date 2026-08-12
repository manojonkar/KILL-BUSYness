import Header from "@/components/Header";
import ContactForm from "./ContactForm";

export default function ContactPage({ searchParams }: { searchParams: { error?: string; sent?: string } }) {
  return (
    <>
      <Header active="Contact" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Contact</span>
          <h2>Begin a conversation.</h2>
          <p>Whether it&apos;s about the book, the audit, or building an Extraordinary Organization — reach the Management Innovations team.</p>
        </div>
        {searchParams?.error ? <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{searchParams.error}</p> : null}
        {searchParams?.sent ? <p style={{ color: "#154D34", fontSize: ".85rem", marginBottom: 14 }}>Message sent — thank you, we&apos;ll be in touch.</p> : null}
        <div className="card" style={{ padding: 30, maxWidth: 600 }}>
          <ContactForm />
        </div>
        <div className="ribbon">
          <div className="logos">
            <span>Management Innovations</span>
            <span>·</span>
            <span>ODeX Extraordinary Organizations</span>
          </div>
          <div className="author">
            <strong>Manoj Onkar</strong>manoj@managementinnovations.co.in
          </div>
        </div>
      </main>
    </>
  );
}
