import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import PageTracker from "@/components/PageTracker";
import AntiCopy from "@/components/AntiCopy";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ weight: ["300", "400", "700"], subsets: ["latin"], variable: "--font-merriweather" });

export const metadata: Metadata = {
  title: "KILL BUSYness — Organization Audit Portal",
  description: "Build a High-Performance Organization. Read the book, run your Organization Audit, and track your journey."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css" />
        <link rel="stylesheet" href="/css/gamification.css" />
        <link rel="stylesheet" href="/css/mobile.css" />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              overflow-x: hidden;
              width: 100%;
              max-width: 100vw;
            }
            img {
              -webkit-user-drag: none;
              max-width: 100%;
              height: auto;
            }
            @media print {
              body {
                display: none !important;
              }
            }
          `
        }} />
      </head>
      <body className={`${inter.variable} ${merriweather.variable}`}>
        <AntiCopy />
        <PageTracker />
        
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-PE6PHBL17Z" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-PE6PHBL17Z');
          `}
        </Script>

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
