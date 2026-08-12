import Link from "next/link";
import { EMBLEM } from "@/lib/brand";

export default function SplashPage() {
  return (
    <Link
      href="/home"
      aria-label="Enter the KILL BUSYness portal"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg,#0b1730,#132a52)",
        textDecoration: "none",
        cursor: "pointer",
        padding: 24
      }}
    >
      <img
        src={EMBLEM}
        alt="KILL BUSYness"
        style={{
          width: "min(62vh, 78vw)",
          height: "min(62vh, 78vw)",
          objectFit: "contain",
          borderRadius: "50%",
          boxShadow: "0 40px 120px -40px rgba(0,0,0,.8)"
        }}
      />
      <span
        style={{
          marginTop: 34,
          fontFamily: "var(--mono)",
          textTransform: "uppercase",
          letterSpacing: ".22em",
          fontSize: ".78rem",
          color: "#c9cbd3"
        }}
      >
        Click to enter
      </span>
    </Link>
  );
}
