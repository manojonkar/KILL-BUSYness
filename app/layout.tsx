import type { Metadata } from "next";
import PageTracker from "@/components/PageTracker";

export const metadata: Metadata = {
  title: "KILL BUSYness — Organization Audit Portal",
  description: "Build a High-Performance Organization. Read the book, run your Organization Audit, and track your journey."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css" />
      </head>
      <body>
        <PageTracker />
        {children}
        <footer className="foot site-foot">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 10 }}>
            {[
              ["www.manojonkar.com", "https://www.manojonkar.com"],
              ["www.managementinnovations.in", "https://www.managementinnovations.in"],
              ["www.reinventorganizations.com", "https://www.reinventorganizations.com"],
              ["www.inventleadership.com", "https://www.inventleadership.com"],
              ["www.OD-EX.com", "https://www.OD-EX.com"]
            ].map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink-soft)", textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </div>
          KILL BUSYness Portal · Management Innovations · ODeX Extraordinary Organizations · © Manoj Onkar
          <br />
          <a href="/privacy" style={{ color: "var(--ink-faint)", textDecoration: "underline" }}>Privacy &amp; data handling</a>
        </footer>
      </body>
    </html>
  );
}
