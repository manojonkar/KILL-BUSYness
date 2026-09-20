import Link from "next/link";
import Header from "@/components/Header";

export const metadata = {
  title: "KILL BUSYness Masterclass",
  description: "Learn how to transition from BUSYness to a High Performance Organization.",
};

export default function MasterclassPage() {
  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow" style={{ color: "#0E9C74" }}>Executive Briefing</span>
          <h2>KILL BUSYness Masterclass</h2>
          <p>Watch the 5-minute briefing on how to unblock stalled growth and build a High Performance Organization.</p>
        </div>

        <div className="card" style={{ padding: "0", overflow: "hidden", marginBottom: "40px", maxWidth: "900px", margin: "0 auto 40px auto", background: "#000" }}>
          <video 
            controls 
            autoPlay 
            style={{ width: "100%", display: "block", aspectRatio: "16/9" }}
            poster="/images/roar-concept.png"
          >
            <source src="/videos/KILL_BUSYness_VSL.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="mobile-stack" style={{ gap: "32px", maxWidth: "1000px", margin: "0 auto", alignItems: "stretch" }}>
          
          <div className="card" style={{ padding: "32px", flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>1. Book an Awareness Session</h3>
            <p style={{ color: "#475569", marginBottom: "24px", flexGrow: 1 }}>
              Ready to confront the BUSYness trap head-on? Book Manoj Onkar for a 1-4 hour Executive Awareness Session or a 2-Day Workshop with your leadership team.
            </p>
            <Link href="https://calendar.app.google/25NHpaCLt7d1UvYRA" className="btn btn-primary" style={{ textAlign: "center" }}>
              Inquire About Workshops
            </Link>
          </div>

          <div className="card" style={{ padding: "32px", flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>2. Align Your Leadership</h3>
            <p style={{ color: "#475569", marginBottom: "24px", flexGrow: 1 }}>
              Get everyone speaking the same language. Order a package of the KILL BUSYness book for your entire management team to start the transition.
            </p>
            <Link href="/buy?format=paperback" className="btn btn-dark" style={{ textAlign: "center" }}>
              Order the Book for your Team
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}


